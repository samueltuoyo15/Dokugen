import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
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
   - Be specific about what changed and the intent/behavior (e.g., say "fix(ui): close modal after click" instead of generic "update handler" or "fix bug")
   - AVOID generic descriptions (never output "update code", "modify file", "update handler", "refactor code", etc.)
   - Keep it under 150 characters total (including type and scope)
   - NO trailing punctuation
   - NO emojis ever
   - MUST be a complete sentence

3. MESSAGE STRUCTURE:
   - The entire commit message must be exactly one to three lines, be very detailed.. even if it has to take you four lines go ahead!
   - Format: type(scope): description
   - Example: "feat(auth): add password reset functionality"
   - Example: "fix(support): close dropdown checkbox when clicking outside"
   - Example: "refactor(ui): simplify component state management"

4. QUALITY CHECKS - YOUR OUTPUT MUST PASS:
   - Contains opening and closing parentheses
   - Has a colon after the parentheses
   - Description exists and is not empty
   - Total length <= 150 characters
   - No markdown formatting
   - No code blocks

5. FAILURE MODE:
   - If you cannot generate a proper message, return exactly: "chore: update code"

YOUR TASK:
Analyze this git diff like your life depends on it, pay close attention and generate exactly ONE proper commit message following all rules above.

Git diff:
${diff}

Commit message:
`.trim();

router.post(
  "/generate-commit",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { diff, userInfo } = req.body;

      if (!diff) {
        return res.status(400).json({ error: "No git diff provided" });
      }

      if (userInfo?.username && userInfo?.email) {
        trackUser({ ...userInfo, id: userInfo.id || uuidv4() }, "commit").catch(() => {});
      }

      const prompt = buildCommitPrompt(diff);
      let message = "";

      // 1. Primary Attempt: OpenRouter ($0 Cost)
      if (process.env.OPENROUTER_API_KEY) {
        try {
          const openrouter = new OpenAI({
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
            defaultHeaders: {
              "HTTP-Referer": "https://dokugen.samueltuoyo.com",
              "X-Title": "Dokugen",
            },
          });

          const completion = await openrouter.chat.completions.create({
            model: process.env.OPENROUTER_COMMIT_MODEL || "openrouter/free",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300,
          });

          message = completion.choices[0]?.message?.content?.trim() || "";
        } catch (err: any) {
          logger.warn(err, "OpenRouter commit generation failed, falling back to DeepSeek...");
        }
      }

      // 2. Fallback Attempt: DeepSeek
      if (!message && process.env.DEEPSEEK_API_KEY) {
        try {
          const deepseek = new OpenAI({
            apiKey: process.env.DEEPSEEK_API_KEY,
            baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
          });

          const completion = await deepseek.chat.completions.create({
            model: process.env.COMMIT_MODEL_NAME || "deepseek-v4-flash",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300,
          });

          message = completion.choices[0]?.message?.content?.trim() || "";
        } catch (err: any) {
          logger.error(err, "DeepSeek commit generation failed");
        }
      }

      if (!message) {
        message = "chore: update code";
      }

      const cleanMessage = message.replace(/^["']|["']$/g, "");
      return res.status(200).json({ message: cleanMessage });
    } catch (error: any) {
      logger.error(error, "Error generating commit message");
      const errorMessage = error?.response?.data?.error?.message || error?.message || "Internal Server Error";
      return res.status(500).json({ error: errorMessage });
    }
  },
);

export default router;
