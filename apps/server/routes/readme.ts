import { Router, Request, Response } from "express";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { fetchGitHubReadme } from "../lib/fetchGitHubReadme";
import { gunzipAsync } from "../middleware/compression";
import { trackUser } from "../lib/supabaseTracker";
import { getSystemInstruction } from "../prompts/systemInstruction";
import { buildUserPrompt } from "../prompts/userPrompt";
import logger from "../utils/logger";

const router = Router();

router.post(
  "/generate-readme",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        projectType,
        projectFiles,
        fullCode: rawFullCode,
        userInfo,
        options = {},
        existingReadme: rawExistingReadme,
        repoUrl,
        customReadmeFormat,
        compressed = false,
        geminiApiKey,
        groqApiKey,
      } = req.body;
      logger.info({ projectType, compressed, hasExistingReadme: !!rawExistingReadme }, "Generate README request received");

      const apiKey = geminiApiKey || groqApiKey || process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "No API Key Provided" });
      }

      let fullCode = rawFullCode;
      let existingReadme = rawExistingReadme;

      if (compressed) {
        if (rawFullCode) {
          const buffer = Buffer.from(rawFullCode, "base64");
          const decompressed = await gunzipAsync(buffer);
          fullCode = decompressed.toString("utf-8");
        }
        if (rawExistingReadme) {
          const buffer = Buffer.from(rawExistingReadme, "base64");
          const decompressed = await gunzipAsync(buffer);
          existingReadme = decompressed.toString("utf-8");
        }
      }

      if (
        !projectType ||
        !projectFiles ||
        !fullCode ||
        (!userInfo && os.platform() !== "linux")
      ) {
        return res
          .status(400)
          .json({ error: "Missing required fields in request body" });
      }

      let formatTemplate = "";
      if (customReadmeFormat) {
        formatTemplate = await fetchGitHubReadme(customReadmeFormat);
      }

      const { username, email, osInfo } = userInfo || {};
      if (!username)
        return res.status(400).json({ message: "Missing OS username and ID" });

      const id = userInfo?.id || uuidv4();

      // Start user tracking in background/Promise.all
      const [_, response] = await Promise.all([
        trackUser({ username, email, id, osInfo }),

        (async () => {
          const systemInstruction = getSystemInstruction(options);
          const userPrompt = buildUserPrompt(
            formatTemplate,
            repoUrl,
            projectType,
            projectFiles,
            fullCode,
            existingReadme,
            options
          );

          const model = process.env.MODEL_NAME || "gemini-2.5-flash";
          const resModel = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: userPrompt }]
                }
              ],
              system_instruction: {
                parts: [{ text: systemInstruction }]
              }
            })
          });

          if (!resModel.ok) {
            const errorText = await resModel.text();
            throw new Error(`Gemini API error: ${resModel.statusText} - ${errorText}`);
          }

          return resModel;
        })(),
      ]);

      if (!response.body) {
        throw new Error("No response body from Gemini API");
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const decoder = new TextDecoder();
      let buffer = "";

      let clientDisconnected = false;
      req.on("close", () => {
        clientDisconnected = true;
        logger.warn("Client disconnected during generation.");
      });

      for await (const chunk of response.body as any) {
        if (clientDisconnected) break;
        
        const chunkText = decoder.decode(chunk, { stream: true });
        buffer += chunkText;
        
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith("data: ")) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.candidates?.[0]?.content?.parts?.[0]?.text;
              if (delta) {
                res.write(`data: ${JSON.stringify({ response: delta })}\n\n`);
              }
            } catch (e) {
              // Ignore parse errors on partial streams
            }
          }
        }
      }

      if (!clientDisconnected) {
        res.end();
        logger.info("README Generated Successfully");
      }
    } catch (error: any) {
      console.error("Error:", error);
      res.status(500).json({ error: "error generating readme" });
    }
  }
);

export default router;
