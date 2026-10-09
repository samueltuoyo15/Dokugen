import { type Request, type Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { createOpenAIClient, getModelName } from "../lib/openaiClient";
import { trackUser } from "../lib/supabaseTracker";
import { getVerifiedGitHubUser } from "../middleware/githubAuth";
import logger from "../utils/logger";

const router = Router();

const SYSTEM_PROMPT = `You are an expert Git assistant.
Your task is to analyze a git diff and generate a single-line Conventional Commit message following this pattern:
<type>(<scope>): <description>

Allowed types: feat, fix, refactor, chore, docs, style, test, perf, ci, build.

Rules:
1. Output ONLY the single commit message line.
2. Do NOT output markdown formatting, code fences, backticks, quotes, explanations, or multiple lines.
3. Start the description with a lowercase imperative verb.
4. Keep the entire message concise and under 72 characters.`;

const CONVENTIONAL_COMMIT_REGEX = /^(feat|fix|refactor|chore|docs|style|test|perf|ci|build)(\([^)]+\))?:\s*(.+)$/i;

function sanitizeCommitMessage(raw: string): string {
  if (!raw || !raw.trim()) {
    return "chore: update codebase";
  }

  const text = raw
    .replace(/```[a-z]*\n?/gi, "")
    .replace(/```/g, "")
    .trim();
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  for (const line of lines) {
    const cleaned = line
      .replace(/^[-*•]\s+/, "")
      .replace(/^["'`]|["'`]$/g, "")
      .replace(/^(commit message|commit|suggested commit|generated commit):\s*/i, "")
      .trim();

    const match = cleaned.match(CONVENTIONAL_COMMIT_REGEX);
    if (match) {
      const type = match[1].toLowerCase();
      const scope = match[2] || "";
      let description = match[3].trim().replace(/\.+$/, "");
      description = description.replace(/^["'`]|["'`]$/g, "");
      const candidate = `${type}${scope}: ${description}`;
      if (candidate.length <= 72 && /^[a-z]/.test(description)) return candidate;
    }
  }

  return "chore: update codebase";
}

router.post("/generate-commit", async (req: Request, res: Response): Promise<void> => {
  try {
    const { diff, userInfo } = req.body;

    if (typeof diff !== "string" || !diff.trim()) {
      res.status(400).json({ error: "No git diff provided" });
      return;
    }

    let processedDiff = diff;
    const MAX_DIFF_CHARS = 100_000;
    if (processedDiff.length > MAX_DIFF_CHARS) {
      processedDiff = `${processedDiff.substring(0, MAX_DIFF_CHARS)}\n\n...[TRUNCATED FOR PAYLOAD SIZE LIMIT]...`;
      logger.info(`Truncating git diff from ${diff.length} to ${MAX_DIFF_CHARS} chars`);
    }

    const verifiedUser = getVerifiedGitHubUser(res);
    trackUser({ ...userInfo, ...verifiedUser, id: userInfo?.id || uuidv4() }, "commit").catch(() => {});

    const configuredModelName = process.env.COMMIT_MODEL_NAME;
    if (!configuredModelName) {
      throw new Error("COMMIT_MODEL_NAME is missing");
    }
    const modelName = getModelName(configuredModelName);

    const openai = await createOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Git diff:\n\n${processedDiff}\n\nGenerate the single-line conventional commit message:`,
        },
      ],
      max_tokens: 150,
      temperature: 0.2,
    });

    const rawMessage = completion.choices[0]?.message?.content?.trim() || "";
    const cleanMessage = sanitizeCommitMessage(rawMessage);
    res.status(200).json({ message: cleanMessage });
  } catch (error: unknown) {
    logger.error(error, "Error generating commit message");
    const err = error as {
      response?: { data?: { error?: { message?: string } } };
      message?: string;
    };
    const errorMessage = err?.response?.data?.error?.message || err?.message || "Internal Server Error";
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
