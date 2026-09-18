import express, { Router, Request, Response } from "express";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { createOpenAIClient, getModelName } from "../lib/openaiClient";
import { fetchGitHubReadme } from "../lib/fetchGitHubReadme";
import { gunzipAsync } from "../middleware/compression";
import { trackUser } from "../lib/supabaseTracker";
import { getSystemInstruction } from "../prompts/systemInstruction";
import { buildUserPrompt } from "../prompts/userPrompt";
import logger from "../utils/logger";

const router = Router();

router.post(
  "/generate-readme",
  express.json({ limit: "100mb" }),
  async (req: Request, res: Response): Promise<any> => {
    const controller = new AbortController();
    let clientDisconnected = false;

    req.on("close", () => {
      clientDisconnected = true;
      controller.abort();
      logger.warn("Client disconnected during README generation. Aborted request.");
    });

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
      } = req.body;

      logger.info(
        { projectType, compressed, hasExistingReadme: !!rawExistingReadme },
        "Generate README request received (OpenAI-compatible SDK)"
      );

      let fullCode = rawFullCode;
      let existingReadme = rawExistingReadme;

      if (compressed) {
        const MAX_DECOMPRESSED_BYTES = 50 * 1024 * 1024;
        if (rawFullCode) {
          const buffer = Buffer.from(rawFullCode, "base64");
          const decompressed = await gunzipAsync(buffer);
          if (decompressed.length > MAX_DECOMPRESSED_BYTES) {
            return res.status(413).json({ error: "Payload too large after decompression (max 50 MB)" });
          }
          fullCode = decompressed.toString("utf-8");
        }
        if (rawExistingReadme) {
          const buffer = Buffer.from(rawExistingReadme, "base64");
          const decompressed = await gunzipAsync(buffer);
          if (decompressed.length > MAX_DECOMPRESSED_BYTES) {
            return res.status(413).json({ error: "Payload too large after decompression (max 50 MB)" });
          }
          existingReadme = decompressed.toString("utf-8");
        }
      }

      if (
        !projectType ||
        !projectFiles ||
        !fullCode ||
        (!userInfo && os.platform() !== "linux")
      ) {
        return res.status(400).json({ error: "Missing required fields in request body" });
      }

      const MAX_CODE_CHARS = 2_500_000; // ~2.5MB to safely stay under Vertex 10MB payload limit
      if (fullCode && fullCode.length > MAX_CODE_CHARS) {
        logger.info(`Truncating fullCode from ${fullCode.length} to ${MAX_CODE_CHARS} chars`);
        fullCode = fullCode.substring(0, MAX_CODE_CHARS) + "\n\n...[TRUNCATED FOR PAYLOAD SIZE]...";
      }

      const MAX_README_CHARS = 50_000; 
      if (existingReadme && existingReadme.length > MAX_README_CHARS) {
        existingReadme = existingReadme.substring(0, MAX_README_CHARS) + "\n...[TRUNCATED]...";
      }


      let formatTemplate = "";
      if (customReadmeFormat) {
        formatTemplate = await fetchGitHubReadme(customReadmeFormat);
      }

      const { username, email, osInfo } = userInfo || {};
      if (!username) return res.status(400).json({ message: "Missing OS username and ID" });

      const id = userInfo?.id || uuidv4();

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

      const configuredModelName = process.env.README_MODEL_NAME;
      if(!configuredModelName) {
        throw new Error("Model name is missing")
      }
      const modelName = getModelName(configuredModelName);

      const openai = await createOpenAIClient();

      const stream = await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }, {
        signal: controller.signal,
      });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let isFirstText = true;
      let initialBuffer = "";

      for await (const chunk of stream) {
        if (clientDisconnected) break;
        const text = chunk.choices[0]?.delta?.content || "";
        if (!text) continue;

        if (isFirstText) {
          initialBuffer += text;
          if (initialBuffer.length >= 20 || initialBuffer.includes("\n")) {
            initialBuffer = initialBuffer.replace(/^```(?:markdown)?\s*\n?/i, "");
            isFirstText = false;
            res.write(`data: ${JSON.stringify({ response: initialBuffer })}\n\n`);
          }
        } else {
          res.write(`data: ${JSON.stringify({ response: text })}\n\n`);
        }
      }

      if (isFirstText && initialBuffer && !clientDisconnected) {
        initialBuffer = initialBuffer.replace(/^```(?:markdown)?\s*\n?/i, "");
        res.write(`data: ${JSON.stringify({ response: initialBuffer })}\n\n`);
      }

      if (!clientDisconnected) {
        res.end();
        logger.info("README generated successfully");
        trackUser({ username, email, id, osInfo }, "readme").catch(() => {});
      }
    } catch (error: any) {
      if (error.name === "AbortError" || error.name === "APIUserAbortError") {
        logger.info("Request successfully aborted after client disconnect.");
        return;
      }

      logger.error(error, "Error generating readme");

      const isRateLimitedOrOverloaded = (err: any): boolean => {
        if (!err) return false;
        const msg = typeof err.message === "string" ? err.message : JSON.stringify(err);
        return msg.includes("429") || msg.includes("503") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("Insufficient Balance");
      };

      if (res.headersSent) {
        const message = isRateLimitedOrOverloaded(error)
          ? "The AI model is currently experiencing high demand or quota limits. Please try again."
          : "An error occurred while generating the README.";
        res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
        res.end();
      } else {
        res.status(isRateLimitedOrOverloaded(error) ? 503 : 500).json({
          error: isRateLimitedOrOverloaded(error)
            ? "The AI model is currently experiencing high demand or quota limits. Please try again."
            : "Error generating readme",
        });
      }
    }
  },
);

export default router;
