import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";
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
      const { diff, geminiApiKey, userInfo } = req.body;

      if (!diff) {
        return res.status(400).json({ error: "No git diff provided" });
      }

      // Track usage fire-and-forget — never block commit generation
      if (userInfo?.username && userInfo?.email) {
        trackUser({ ...userInfo, id: userInfo.id || uuidv4() }, "commit").catch(() => {});
      }



      const primaryModel  = process.env.COMMIT_MODEL_NAME || "gemini-2.5-flash";
      const fallbackModel = process.env.COMMIT_FALLBACK_MODEL_NAME || "gemini-2.5-flash-lite";
      const prompt        = buildCommitPrompt(diff);

      const ai = new GoogleGenAI({
        vertexai: true,
        project:  process.env.GOOGLE_CLOUD_PROJECT!,
        location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
      });

      const makeRequest = async (modelName: string): Promise<string> => {
        const result = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        return result.text ?? "chore: update code";
      };

      const isRateLimitedOrOverloaded = (err: any): boolean => {
        if (!err) return false;
        const status = err.status || err.code;
        const msg = typeof err.message === "string" ? err.message : JSON.stringify(err);
        return (
          status === 503 ||
          status === 429 ||
          msg.includes("503") ||
          msg.includes("429") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("RESOURCE_EXHAUSTED") ||
          msg.includes("Quota exceeded") ||
          msg.includes("Too Many Requests")
        );
      };

      let message: string;
      try {
        message = await makeRequest(primaryModel);
      } catch (primaryErr: any) {
        if (isRateLimitedOrOverloaded(primaryErr) && fallbackModel !== primaryModel) {
          logger.warn(
            { primaryModel, fallbackModel },
            "Primary commit model rate-limited/overloaded - retrying with fallback model"
          );
          message = await makeRequest(fallbackModel);
        } else {
          throw primaryErr;
        }
      }

      // Cleanup quotes if LLM outputs them
      const cleanMessage = message.trim().replace(/^[\"']|[\"']$/g, "");

      return res.status(200).json({ message: cleanMessage });
    } catch (error: any) {
      logger.error(error, "Error generating commit message");
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

export default router;
