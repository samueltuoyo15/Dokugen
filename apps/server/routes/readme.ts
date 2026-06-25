import { Router, Request, Response } from "express";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";
import { fetchGitHubReadme } from "../lib/fetchGitHubReadme";
import { gunzipAsync } from "../middleware/compression";
import { trackUser } from "../lib/supabaseTracker";
import { getSystemInstruction } from "../prompts/systemInstruction";
import { buildUserPrompt } from "../prompts/userPrompt";
import { getCachedContentName, getVersionedModelName } from "../lib/cacheManager";
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

      logger.info(
        { projectType, compressed, hasExistingReadme: !!rawExistingReadme },
        "Generate README request received"
      );

      const apiKey = geminiApiKey || groqApiKey || process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "No API Key Provided" });
      }

      
      let fullCode      = rawFullCode;
      let existingReadme = rawExistingReadme;

      if (compressed) {
        if (rawFullCode) {
          const buffer      = Buffer.from(rawFullCode, "base64");
          const decompressed = await gunzipAsync(buffer);
          fullCode           = decompressed.toString("utf-8");
        }
        if (rawExistingReadme) {
          const buffer      = Buffer.from(rawExistingReadme, "base64");
          const decompressed = await gunzipAsync(buffer);
          existingReadme     = decompressed.toString("utf-8");
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

      const systemInstruction = getSystemInstruction(options);
      const userPrompt        = buildUserPrompt(
        formatTemplate,
        repoUrl,
        projectType,
        projectFiles,
        fullCode,
        existingReadme,
        options
      );

      const modelAlias     = process.env.MODEL_NAME || "gemini-2.5-flash";
      const versionedModel = getVersionedModelName(modelAlias);
      const ai             = new GoogleGenAI({ apiKey });

      const [_, streamResult] = await Promise.all([
        trackUser({ username, email, id, osInfo }),

        (async () => {
          // Try to get (or create) a cached system instruction.
          const cacheName = await getCachedContentName(apiKey, options, modelAlias);

          if (cacheName) {
            //  Cache HIT system instruction is already stored server-side.
            // We pay ~4× less for those tokens on every request.
            logger.info({ cacheName }, "Generating README with context cache");
            return ai.models.generateContentStream({
              model: versionedModel,
              config: {
                cachedContent: cacheName,
              },
              contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            });
          } else {
            // ❌ Cache unavailable — send system instruction the regular way.
            logger.info("Generating README without context cache (fallback)");
            return ai.models.generateContentStream({
              model: modelAlias,
              config: { systemInstruction },
              contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            });
          }
        })(),
      ]);

      
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let clientDisconnected = false;
      req.on("close", () => {
        clientDisconnected = true;
        logger.warn("Client disconnected during README generation.");
      });

  
      for await (const chunk of await streamResult) {
        if (clientDisconnected) break;
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ response: text })}\n\n`);
        }
      }

      if (!clientDisconnected) {
        res.end();
        logger.info("README generated successfully");
      }
    } catch (error: any) {
      console.error("Error:", error);
      res.status(500).json({ error: "error generating readme" });
    }
  }
);

export default router;
