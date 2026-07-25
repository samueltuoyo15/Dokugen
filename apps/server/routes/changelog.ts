import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import { trackUser } from "../lib/supabaseTracker";
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
    return (header + updatedSections.join("\n\n")).trim() + "\n";
  }

  return (header + newVersionBlock + "\n\n" + body).trim() + "\n";
}

router.post(
  "/generate-changelog",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { logs, version = "Unreleased", existingChangelog, userInfo, openrouterApiKey: clientKey, model: clientModel } = req.body;

      if (!logs) {
        return res.status(400).json({ error: "No git log history provided" });
      }

      if (userInfo?.username && userInfo?.email) {
        trackUser({ ...userInfo, id: userInfo.id || uuidv4() }, "changelog").catch(() => {});
      }

      const apiKey = clientKey || process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "Please set an OPENROUTER_API_KEY environment variable to use the CHANGELOG generator. Visit https://dokugen.samueltuoyo.com to learn how to set your key.",
        });
      }

      const baseURL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
      const modelName = clientModel || process.env.CHANGELOG_MODEL_NAME || "openrouter/free";

      const prompt = buildChangelogPrompt(logs, version);

      const openai = new OpenAI({
        apiKey,
        baseURL,
        defaultHeaders: {
          "HTTP-Referer": "https://dokugen.samueltuoyo.com",
          "X-Title": "Dokugen",
        },
      });

      const completion = await openai.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 3000,
      });

      const rawBlock = completion.choices[0]?.message?.content?.trim() || "";
      const cleanBlock = rawBlock.replace(/^```markdown\n?|^```\n?|```$/g, "").trim();

      const finalChangelog = existingChangelog
        ? mergeChangelog(existingChangelog, cleanBlock, version)
        : `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n${cleanBlock}\n`;

      return res.status(200).json({ changelog: finalChangelog });
    } catch (error: any) {
      logger.error(error, "Error generating changelog");
      const errorMessage = error?.response?.data?.error?.message || error?.message || "Internal Server Error";
      return res.status(500).json({ error: errorMessage });
    }
  },
);

export default router;
