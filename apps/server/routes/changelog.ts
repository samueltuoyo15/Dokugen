import { type Request, type Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { createOpenAIClient, getModelName } from "../lib/openaiClient";
import { trackUser } from "../lib/supabaseTracker";
import { getVerifiedGitHubUser } from "../middleware/githubAuth";
import { buildChangelogPrompt } from "../prompts/changelogPrompt";
import logger from "../utils/logger";

const router = Router();

function mergeChangelog(existingContent: string, newVersionBlock: string, versionTitle: string): string {
  if (!existingContent || !existingContent.trim()) {
    return `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n${newVersionBlock}\n`;
  }

  const cleanVersionTitle = versionTitle.replace(/^v/, "").replace(/[\[\]]/g, "");

  // Locate existing header
  const headerMatch = existingContent.match(/^#\s+Changelog[^\n]*\n+(\s*All notable changes[^\n]*\n+)?/i);
  let header = "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n";
  let body = existingContent;

  if (headerMatch) {
    header = headerMatch[0];
    body = existingContent.slice(header.length);
  }

  // Escaped title for regex matching existing section
  const titlePattern = new RegExp(`^##\\s*\\[?${cleanVersionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]?`, "i");

  const sections = body.split(/(?=^##\s+)/m);
  let matched = false;

  const updatedSections = sections.map((section) => {
    if (titlePattern.test(section.trim())) {
      matched = true;
      return newVersionBlock;
    }
    return section;
  });

  if (matched) {
    return `${(header + updatedSections.join("\n\n")).trim()}\n`;
  }

  return `${(`${header + newVersionBlock}\n\n${body}`).trim()}\n`;
}

router.post("/generate-changelog", async (req: Request, res: Response): Promise<void> => {
  try {
    const { logs, version = "Unreleased", existingChangelog, userInfo, model: clientModel } = req.body;

    if (typeof logs !== "string" || !logs.trim()) {
      res.status(400).json({ error: "No git log history provided" });
      return;
    }
    if (typeof version !== "string" || version.length > 100) {
      res.status(400).json({ error: "Invalid changelog version" });
      return;
    }
    if (existingChangelog !== undefined && typeof existingChangelog !== "string") {
      res.status(400).json({ error: "Invalid existing changelog" });
      return;
    }

    const verifiedUser = getVerifiedGitHubUser(res);
    trackUser({ ...userInfo, ...verifiedUser, id: userInfo?.id || uuidv4() }, "changelog").catch(() => {});

    const configuredModel = process.env.CHANGELOG_MODEL_NAME || "gemini-3.1-flash-lite";
    const allowedModels = new Set([
      configuredModel,
      ...(process.env.CHANGELOG_ALLOWED_MODELS || "")
        .split(",")
        .map((model) => model.trim())
        .filter(Boolean),
    ]);
    if (clientModel !== undefined && (typeof clientModel !== "string" || !allowedModels.has(clientModel))) {
      res.status(400).json({ error: "Requested changelog model is not allowed" });
      return;
    }
    const modelName = getModelName(clientModel || configuredModel);

    const MAX_LOG_CHARS = 200_000;
    const MAX_CHANGELOG_CHARS = 500_000;
    const safeLogs = logs.slice(0, MAX_LOG_CHARS);
    const safeExistingChangelog = existingChangelog?.slice(0, MAX_CHANGELOG_CHARS);
    const prompt = buildChangelogPrompt(safeLogs, version);

    const openai = await createOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
    });

    const rawBlock = completion.choices[0]?.message?.content?.trim() || "";
    const cleanBlock = rawBlock.replace(/^```markdown\n?|^```\n?|```$/g, "").trim();

    const finalChangelog = safeExistingChangelog
      ? mergeChangelog(safeExistingChangelog, cleanBlock, version)
      : `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n${cleanBlock}\n`;

    res.status(200).json({ changelog: finalChangelog });
  } catch (error: unknown) {
    logger.error(error, "Error generating changelog");
    const err = error as {
      response?: { data?: { error?: { message?: string } } };
      message?: string;
    };
    const errorMessage = err?.response?.data?.error?.message || err?.message || "Internal Server Error";
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
