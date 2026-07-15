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
      } = req.body;

      logger.info(
        { projectType, compressed, hasExistingReadme: !!rawExistingReadme },
        "Generate README request received"
      );

      const apiKey = geminiApiKey || process.env.GOOGLE_GEMINI_API_KEY;
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

      const modelAlias     = process.env.README_MODEL_NAME || "gemini-2.5-flash";
      const fallbackAlias  = process.env.README_FALLBACK_MODEL || "gemini-2.5-flash";
      const versionedModel = getVersionedModelName(modelAlias);
      const ai             = new GoogleGenAI({ apiKey });

      // Helper: build the stream for a given model alias.
      const buildStream = async (alias: string) => {
        const versioned = getVersionedModelName(alias);
        const cacheName = await getCachedContentName(apiKey, options, alias);
        if (cacheName) {
          logger.info({ cacheName }, "Generating README with context cache");
          return ai.models.generateContentStream({
            model: versioned,
            config: { cachedContent: cacheName },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          });
        } else {
          logger.info({ model: alias }, "Generating README without context cache");
          return ai.models.generateContentStream({
            model: alias,
            config: { systemInstruction },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          });
        }
      };

      const [_, streamResult] = await Promise.all([
        trackUser({ username, email, id, osInfo }, "readme"),
        buildStream(modelAlias),
      ]);

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let clientDisconnected = false;
      req.on("close", () => {
        clientDisconnected = true;
        logger.warn("Client disconnected during README generation.");
      });

      const streamChunks = async (stream: AsyncIterable<any>) => {
        for await (const chunk of await stream) {
          if (clientDisconnected) break;
          const text = chunk.text;
          if (text) {
            res.write(`data: ${JSON.stringify({ response: text })}\n\n`);
          }
        }
      };

      try {
        await streamChunks(streamResult);
      } catch (streamError: any) {
        const is503 = streamError?.status === 503 || streamError?.message?.includes("503") || streamError?.message?.includes("UNAVAILABLE");
        if (is503 && fallbackAlias !== modelAlias) {
          // Primary model is overloaded - silently retry with fallback model.
          logger.warn({ primaryModel: modelAlias, fallbackModel: fallbackAlias }, "Primary model 503 - retrying with fallback model");
          const fallbackStream = await buildStream(fallbackAlias);
          await streamChunks(fallbackStream);
        } else {
          throw streamError;
        }
      }

      if (!clientDisconnected) {
        res.end();
        logger.info("README generated successfully");
      }
    } catch (error: any) {
      logger.error(error, "Error generating readme");
      // If SSE headers were already sent we cannot call res.status().json() -
      // doing so causes ERR_HTTP_HEADERS_SENT. Instead, send an error event
      // through the stream and close it gracefully.
      if (res.headersSent) {
        const is503 = error?.status === 503 || error?.message?.includes("503") || error?.message?.includes("UNAVAILABLE");
        const message = is503
          ? "The AI model is currently experiencing high demand. Please try again in a moment."
          : "An error occurred while generating the README.";
        res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
        res.end();
      } else {
        const is503 = error?.status === 503 || error?.message?.includes("503") || error?.message?.includes("UNAVAILABLE");
        res.status(is503 ? 503 : 500).json({
          error: is503
            ? "The AI model is currently experiencing high demand. Please try again in a moment."
            : "Error generating readme",
        });
      }
    }
  }
);

export default router;
