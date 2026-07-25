import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import { trackUser } from "../lib/supabaseTracker";
import logger from "../utils/logger";

const router = Router();

const buildCommitPrompt = (diff: string): string =>
  `
CRITICAL INSTRUCTIONS - READ CAREFULLY OR YOU WILL FAIL:
You are an expert Git commit message writer. If you output ANYTHING other than a single conventional commit message you have completely failed your job. Do NOT ramble. Do NOT explain yourself. Do NOT list steps. Do NOT write multiple messages. Shut up and just write the damn commit message.

1. FORMAT: Use Conventional Commits format: <type>(<scope>): <description>
   - type: MUST be one of: feat, fix, refactor, chore, docs, style, test, perf
   - scope: The primary module affected. If multiple modules changed, pick the most significant one.
   - description: Clear, imperative description summarizing ALL changes as ONE unified statement

2. DESCRIPTION REQUIREMENTS:
   - Start with an imperative verb (add, fix, remove, update, refactor, etc.)
   - Summarize the overall intent of ALL changes in ONE sentence
   - Be specific about what changed (e.g., "fix(auth): enforce non-null assertions and add BOQ validation across API")
   - AVOID generic descriptions (never output "update code", "modify file", "update handler", "refactor code", etc.)
   - Keep it under 150 characters total (including type and scope)
   - NO trailing punctuation
   - NO emojis ever

3. MESSAGE STRUCTURE:
   - Output EXACTLY ONE single line. ONE commit message. NOT multiple. NOT a list.
   - Format: type(scope): description
   - Example: "feat(auth): add password reset functionality"
   - Example: "refactor(projects,quotations): add file validation and installment amount checks"

4. ABSOLUTE RULES:
   - Output ONLY the commit message string. Nothing else.
   - No explanations, no steps, no reasoning, no bullet points, no markdown
   - If multiple files changed, write ONE summary message covering the main intent
   - If you cannot generate a proper message, return exactly: "chore: update code"

YOUR TASK:
Analyze this git diff and generate exactly ONE conventional commit message summarizing all changes. I swear if you write more than one line or start explaining yourself I will replace you with a regex. Just. Write. The. Commit. Message.

Git diff:
${diff}

ONE LINE. NOW. Commit message:
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

      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "No DeepSeek API Key Provided on Server" });
      }

      const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
      const modelName = process.env.COMMIT_MODEL_NAME || "deepseek-v4-flash";

      const prompt = buildCommitPrompt(diff);

      const openai = new OpenAI({
        apiKey,
        baseURL,
      });

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
  },
);

export default router;
