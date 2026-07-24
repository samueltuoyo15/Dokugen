import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import { trackUser } from "../lib/supabaseTracker";
import logger from "../utils/logger";

const router = Router();

const buildChangelogPrompt = (logs: string, version?: string, existingChangelog?: string): string =>
  `
CRITICAL INSTRUCTIONS - READ CAREFULLY:
You are an expert technical release notes and changelog generator.
You MUST format output adhering strictly to the "Keep a Changelog" (https://keepachangelog.com/en/1.0.0/) standards.

Target Version/Header: ${version ? version : "Unreleased"}

Formatting Rules:
1. Output ONLY markdown formatted changelog entries.
2. Group changes into the following section headers (only include headers that have items):
   - ### Added (for new features)
   - ### Changed (for changes in existing functionality)
   - ### Deprecated (for soon-to-be removed features)
   - ### Removed (for now removed features)
   - ### Fixed (for any bug fixes)
   - ### Security (in case of vulnerabilities)
3. Write clean, professional bullet points summarizing the intent and user impact of each change.
4. Clean up raw commit messages, strip merge commit boilerplate, fix typos, and organize by feature/module.
5. If existing CHANGELOG content is provided below, seamlessly prepend the new version block right after the main "# Changelog" top-level title. Do NOT duplicate existing release sections.
6. Do NOT include markdown code block fences (do not wrap in \\\`\\\`\\\`markdown).

Raw Git Log / Commit History:
${logs}

${existingChangelog ? `Existing CHANGELOG.md:\n${existingChangelog}` : ""}

Changelog output:
`.trim();

router.post(
  "/generate-changelog",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { logs, version, existingChangelog, userInfo } = req.body;

      if (!logs) {
        return res.status(400).json({ error: "No git log history provided" });
      }

      if (userInfo?.username && userInfo?.email) {
        trackUser({ ...userInfo, id: userInfo.id || uuidv4() }, "changelog").catch(() => {});
      }

      const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "No API Key Provided" });
      }

      const isOpenRouter = apiKey.startsWith("sk-or-v1-");
      const baseURL = process.env.DEEPSEEK_BASE_URL || process.env.OPENAI_BASE_URL || (isOpenRouter ? "https://openrouter.ai/api/v1" : "https://api.deepseek.com");
      
      const modelName = process.env.MODEL_NAME || process.env.CHANGELOG_MODEL_NAME || process.env.README_MODEL_NAME || (isOpenRouter ? "meta-llama/llama-3.3-70b-instruct:free" : "deepseek-chat");

      const prompt = buildChangelogPrompt(logs, version, existingChangelog);

      const openai = new OpenAI({
        apiKey,
        baseURL,
      });

      const completion = await openai.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
      });

      const changelog = completion.choices[0]?.message?.content?.trim() || "";
      const cleanChangelog = changelog.replace(/^```markdown\n?|^```\n?|```$/g, "").trim();

      return res.status(200).json({ changelog: cleanChangelog });
    } catch (error: any) {
      logger.error(error, "Error generating changelog");
      const errorMessage = error?.response?.data?.error?.message || error?.message || "Internal Server Error";
      return res.status(500).json({ error: errorMessage });
    }
  },
);

export default router;
