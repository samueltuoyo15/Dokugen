import { type Request, type Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { extractCompletionMessage, sanitizeCommitMessage } from "../lib/commitMessage";
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

router.post("/generate-commit", async (req: Request, res: Response): Promise<void> => {
  try {
    const { diff, userInfo, previousMessage } = req.body;

    if (typeof diff !== "string" || !diff.trim()) {
      res.status(400).json({ error: "No git diff provided" });
      return;
    }

    const verifiedUser = getVerifiedGitHubUser(res);
    trackUser({ ...userInfo, ...verifiedUser, id: userInfo?.id || uuidv4() }, "commit").catch(() => {});

    const configuredModelName = process.env.COMMIT_MODEL_NAME;
    if (!configuredModelName) {
      throw new Error("COMMIT_MODEL_NAME is missing");
    }
    const modelName = getModelName(configuredModelName);

    const openai = await createOpenAIClient();

    const completion = await openai.chat.completions.create(
      {
        model: modelName,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Git diff:\n\n${diff}\n\nGenerate the single-line conventional commit message:${
              typeof previousMessage === "string" && previousMessage.trim()
                ? `\nThe previous suggestion was "${previousMessage.trim()}". Generate a meaningfully different, more specific message.`
                : ""
            }`,
          },
        ],
        max_tokens: 150,
        temperature: 0.2,
      },
      { timeout: 25_000, maxRetries: 0 },
    );

    const choice = completion.choices?.[0];
    const rawMessage = extractCompletionMessage(completion);
    const result = sanitizeCommitMessage(rawMessage);

    if ("reason" in result) {
      logger.warn(
        { modelName, finishReason: choice?.finish_reason, rawMessage, reason: result.reason },
        "Rejecting invalid generated commit message",
      );
      res.status(422).json({ error: result.reason });
      return;
    }

    if (result.repaired) {
      logger.info({ modelName, rawMessage, message: result.message }, "Repaired generated commit message");
    }
    res.status(200).json({ message: result.message });
  } catch (error: unknown) {
    logger.error(error, "Error generating commit message");
    const err = error as {
      response?: { data?: { error?: { message?: string } } };
      message?: string;
    };
    const isTimeout = (error as { name?: string }).name === "APIConnectionTimeoutError";
    const errorMessage = isTimeout
      ? "Commit-message generation timed out. Please try again."
      : err?.response?.data?.error?.message || err?.message || "Internal Server Error";
    res.status(isTimeout ? 504 : 500).json({ error: errorMessage });
  }
});

export default router;
