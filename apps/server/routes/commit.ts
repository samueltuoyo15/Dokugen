import { type Request, type Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { createOpenAIClient, getModelName } from "../lib/openaiClient";
import { trackUser } from "../lib/supabaseTracker";
import logger from "../utils/logger";

const router = Router();

const buildCommitPrompt = (diff: string): string =>
  `
CRITICAL INSTRUCTIONS - READ CAREFULLY:
You are an expert Git commit message writer. You MUST follow ALL these rules:

1. FORMAT: Use Conventional Commits format: <type>(<scope>): <description>
   - type: MUST be one of: feat, fix, refactor, chore, docs, style, test, perf
   - scope: Should be the module/file affected (e.g., "auth", "api", "ui", "config")
   - description: Clear, imperative description in present tense

2. DESCRIPTION REQUIREMENTS:
   - Start with an imperative verb (add, fix, remove, update, refactor, etc.)
   - Be specific about what changed
   - Keep it under 72 characters total (including type and scope)
   - NO trailing punctuation
   - NO emojis ever
   - MUST be a complete sentence

3. MESSAGE STRUCTURE:
   - The entire commit message must be exactly one line
   - Format: type(scope): description
   - Example: "feat(auth): add password reset functionality"
   - Example: "fix(api): handle null response in user endpoint"
   - Example: "refactor(ui): simplify component state management"

4. QUALITY CHECKS - YOUR OUTPUT MUST PASS:
   - Contains opening and closing parentheses
   - Has a colon after the parentheses
   - Description exists and is not empty
   - Total length ≤ 72 characters
   - No markdown formatting
   - No code blocks
   - No explanations or notes

5. FAILURE MODE:
   - If you cannot generate a proper message, return exactly: "chore: update code"

YOUR TASK:
Analyze this git diff and generate exactly ONE proper commit message following all rules above.

Git diff:
\${diff}

Commit message:
`.trim();

router.post("/generate-commit", async (req: Request, res: Response): Promise<any> => {
  try {
    const { diff, userInfo } = req.body;

    if (!diff) {
      return res.status(400).json({ error: "No git diff provided" });
    }

    let processedDiff = diff;
    const MAX_DIFF_CHARS = 100_000; // ~100k characters for a git diff is plenty and keeps payload small
    if (processedDiff.length > MAX_DIFF_CHARS) {
      processedDiff = `${processedDiff.substring(0, MAX_DIFF_CHARS)}\n\n...[TRUNCATED FOR PAYLOAD SIZE LIMIT]...`;
      logger.info(`Truncating git diff from ${diff.length} to ${MAX_DIFF_CHARS} chars`);
    }

    if (userInfo?.username && userInfo?.email) {
      trackUser({ ...userInfo, id: userInfo.id || uuidv4() }, "commit").catch(() => {});
    }

    const configuredModelName = process.env.COMMIT_MODEL_NAME;

    if (!configuredModelName) {
      throw new Error("COMMIT_MODEL_NAME is missing");
    }
    const modelName = getModelName(configuredModelName);

    const prompt = buildCommitPrompt(processedDiff);

    const openai = await createOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    const message = completion.choices[0]?.message?.content?.trim() || "chore: update code";
    const cleanMessage = message.replace(/^["']|["']$/g, "");
    return res.status(200).json({ message: cleanMessage });
  } catch (error: any) {
    logger.error(error, "Error generating commit message");
    const errorMessage = error?.response?.data?.error?.message || error?.message || "Internal Server Error";
    return res.status(500).json({ error: errorMessage });
  }
});

export default router;
