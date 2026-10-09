import { Router, type Request, type Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { fetchGitHubReadme } from "../lib/fetchGitHubReadme";
import { createOpenAIClient, getModelName } from "../lib/openaiClient";
import { trackUser } from "../lib/supabaseTracker";
import { gunzipAsync } from "../middleware/compression";
import { getVerifiedGitHubUser } from "../middleware/githubAuth";
import { getSystemInstruction } from "../prompts/systemInstruction";
import { buildUserPrompt } from "../prompts/userPrompt";
import logger from "../utils/logger";

const router = Router();

router.post("/generate-readme", async (req: Request, res: Response): Promise<void> => {
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
      templateUrl,
      compressed = false,
    } = req.body;

    logger.info(
      { projectType, compressed, hasExistingReadme: !!rawExistingReadme },
      "Generate README request received (OpenAI-compatible SDK)",
    );

    let fullCode = rawFullCode;
    let existingReadme = rawExistingReadme;

    if (compressed) {
      const MAX_DECOMPRESSED_BYTES = 50 * 1024 * 1024;
      if (rawFullCode) {
        const buffer = Buffer.from(rawFullCode, "base64");
        const decompressed = await gunzipAsync(buffer, MAX_DECOMPRESSED_BYTES);
        fullCode = decompressed.toString("utf-8");
      }
      if (rawExistingReadme) {
        const buffer = Buffer.from(rawExistingReadme, "base64");
        const decompressed = await gunzipAsync(buffer, MAX_DECOMPRESSED_BYTES);
        existingReadme = decompressed.toString("utf-8");
      }
    }

    if (typeof projectType !== "string" || !Array.isArray(projectFiles) || typeof fullCode !== "string" || !fullCode) {
      res.status(400).json({ error: "Missing required fields in request body" });
      return;
    }

    const MAX_CODE_CHARS = 2_500_000; // ~2.5MB to safely stay under Vertex 10MB payload limit
    if (fullCode && fullCode.length > MAX_CODE_CHARS) {
      logger.info(`Truncating fullCode from ${fullCode.length} to ${MAX_CODE_CHARS} chars`);
      fullCode = `${fullCode.substring(0, MAX_CODE_CHARS)}\n\n...[TRUNCATED FOR PAYLOAD SIZE]...`;
    }

    const MAX_README_CHARS = 50_000;
    if (existingReadme && existingReadme.length > MAX_README_CHARS) {
      existingReadme = `${existingReadme.substring(0, MAX_README_CHARS)}\n...[TRUNCATED]...`;
    }

    let formatTemplate = "";
    if (templateUrl) {
      formatTemplate = await fetchGitHubReadme(templateUrl);
    }

    const verifiedUser = getVerifiedGitHubUser(res);
    const { osInfo, opted_out } = userInfo || {};

    const id = userInfo?.id || uuidv4();

    const systemInstruction = getSystemInstruction(options);
    const userPrompt = buildUserPrompt(
      formatTemplate,
      repoUrl,
      projectType,
      projectFiles,
      fullCode,
      existingReadme,
      options,
    );

    const configuredModelName = process.env.README_MODEL_NAME;
    if (!configuredModelName) {
      throw new Error("Model name is missing");
    }
    const modelName = getModelName(configuredModelName);

    const openai = await createOpenAIClient();

    const stream = await openai.chat.completions.create(
      {
        model: modelName,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      },
      {
        signal: controller.signal,
      },
    );

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
      const finalUsageType = rawExistingReadme ? "update" : "readme";
      trackUser({ ...verifiedUser, id, osInfo, opted_out }, finalUsageType).catch(() => {});
    }
  } catch (error: unknown) {
    const errorObj = error as { name?: string; message?: string };
    if (errorObj.name === "AbortError" || errorObj.name === "APIUserAbortError") {
      logger.info("Request successfully aborted after client disconnect.");
      return;
    }

    logger.error(error, "Error generating readme");

    const isRateLimitedOrOverloaded = (err: unknown): boolean => {
      if (!err) return false;
      const errRecord = err as { message?: string };
      const msg = typeof errRecord.message === "string" ? errRecord.message : JSON.stringify(err);
      return (
        msg.includes("429") ||
        msg.includes("503") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("Insufficient Balance")
      );
    };

    if (res.headersSent) {
      const message = isRateLimitedOrOverloaded(error)
        ? "The AI model is currently experiencing high demand or quota limits. Please try again."
        : "An error occurred while generating the README.";
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    } else {
      const isDecompressionLimit = errorObj.name === "RangeError" || errorObj.message?.includes("maxOutputLength");
      res.status(isDecompressionLimit ? 413 : isRateLimitedOrOverloaded(error) ? 503 : 500).json({
        error: isDecompressionLimit
          ? "Payload too large after decompression (max 50 MB)"
          : isRateLimitedOrOverloaded(error)
            ? "The AI model is currently experiencing high demand or quota limits. Please try again."
            : "Error generating readme",
      });
    }
  }
});

export default router;
