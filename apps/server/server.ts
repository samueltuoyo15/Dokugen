import express, { Application, Request, Response } from "express";
import { supabase } from "./supabase";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";
import helmet from "helmet";
import { fetchGitHubReadme } from "./lib/fetchGitHubReadme";
import cors from "cors";
import rateLimit from "express-rate-limit";
import logger from "./utils/logger";
import { gunzip } from "zlib";
import { promisify } from "util";
import cron from "node-cron";
import dotenv from "dotenv";
dotenv.config();

const gunzipAsync = promisify(gunzip);

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many requests, try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    return req.path === "/health" || req.path === "/api/health";
  },
});

const app: Application = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["*"],
    credentials: true,
  }),
);
app.use(helmet());
app.use(limiter);
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY || "" });

/*
TODO
const generateCacheKey = (projectType: string, projectFiles: string[], fullCode: string) => {
  const hash = crypto.createHash('sha256')
  hash.update(projectType + projectFiles.join('') + fullCode)
  return `readme:${hash.digest('hex')}`
}
*/

/*
TODO
export async function retryAsync<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryAsync(fn, retries - 1, delay * 2);
  }
}
*/

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "Ok",
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
});

app.post(
  "/api/generate-readme",
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
      logger.info(req.body);

      const apiKey = geminiApiKey || process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "No API Key Provided" });
      }

      const ai = new GoogleGenAI({ apiKey });

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

      const [_, result] = await Promise.all([
        (async () => {
          if (!email) return;
          const { data: existingUser, error: userError } = await supabase
            .from("active_users")
            .select("id, usage_count")
            .eq("email", email)
            .single();
          if (userError && userError.code !== "PGRST116") throw userError;
          if (existingUser) {
            const updateData: { usage_count: number; osInfo?: string } = {
              usage_count: existingUser.usage_count + 1,
            };
            if (osInfo) updateData.osInfo = osInfo;
            await supabase
              .from("active_users")
              .update(updateData)
              .eq("id", existingUser.id);
          } else {
            await supabase
              .from("active_users")
              .insert([{ username, email, id, osInfo, usage_count: 1 }]);
          }
          logger.info(`Updated Active user ${username}, ${email} (${osInfo})`);
        })(),

        (async () => {
          const systemInstruction = `
      # Dokugen README Writer

      You're writing a README that explains what this project does and why someone would want to use it. Write like you're the developer explaining your project to another developer over coffee - natural, casual, but still clear.

      ## The Overview Section - THIS IS CRITICAL
      
      The Overview should answer: "What does this thing actually do and what problem does it solve?"
      
      BAD (too technical, lists technologies):
      "This project is a robust TypeScript Node.js Fastify backend service that intelligently processes data. It leverages Google Gemini AI for advanced data extraction and the docx library for generating professionally formatted documents."
      
      GOOD (natural, problem-focused):
      "This project helps you do X by doing Y. It takes your input, processes it, and gives you back exactly what you need. No complicated setup, just straightforward functionality that works."

      ## Writing Style Rules

      1. **Talk about the product, not the tech stack**
         - Focus on what it does, not how it's built
         - Save technology mentions for a dedicated "Technologies Used" section
         - The Overview should be understandable by non-technical people

      2. **Write naturally**
         - Use contractions (it's, you'll, don't)
         - Write like you're explaining to a friend
         - Avoid corporate buzzwords like "robust", "leverages", "facilitates"
         - No AI-sounding phrases like "seamlessly integrates" or "cutting-edge"

      3. **Be specific about what it does**
         - Instead of "processes data", describe the actual transformation
         - Instead of "provides functionality", say what users can actually do
         - Use concrete examples based on the actual code

      ## For Backend/API Projects

      When you detect a backend project, use ONLY the sections that are explicitly requested via the options passed in the user prompt. Do NOT add sections that are marked as skipped. The user prompt will contain explicit SKIP instructions — follow them strictly.

      ## Critical Rules

      1. **Overview Section**:
         - Must be written for non-technical people
         - Focus on the problem it solves
         - No technology names (save those for "Technologies Used")
         - 2-3 sentences max
         - Natural, conversational tone

      2. **API Documentation** (for backend projects):
         - Document EVERY endpoint you find in the code
         - Show actual request/response examples
         - Explain what each endpoint does in plain English
         - List all environment variables with examples
         - Don't hide documentation in collapsible sections

      3. **Formatting**:
         - Never wrap output in markdown code blocks
         - Use proper Markdown formatting
         - NO EMOJIS AT ALL - keep it clean and professional
         - If you find screenshots in public folders (demo.png, screenshot.png), include them

      4. **Tone**:
         - Sound like a human wrote it
         - Casual but professional
         - No corporate speak or AI buzzwords
         - Use contractions and natural language

      5. **Always include the Dokugen badge at the bottom**

      Remember: The goal is to make someone understand what this project does and why they'd want to use it, not to impress them with technology names.
      `;

          const userPrompt = formatTemplate
            ? `
      STRICTLY USE THIS TEMPLATE STRUCTURE:
    """
    ${formatTemplate}
    """

    INJECT THESE PROJECT DETAILS:
    - Repo URL: ${repoUrl || "Not specified"}
    - Project Type: ${projectType}
    - Main Files: ${projectFiles.slice(0, 10).join(", ")}...
    - Code Sample: ${fullCode.substring(0, 1000)}...

    RULES:
    1. PRESERVE ALL TEMPLATE SECTIONS IN ORDER
    2. REPLACE CONTENT BUT KEEP STYLING
    3. ADD THIS BADGE AT BOTTOM:
       [![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)`
            : existingReadme
              ? `You are updating an existing README.md file. Your task is to INTELLIGENTLY UPDATE only the auto-generated sections while PRESERVING all custom content added by the user.

      ## EXISTING README CONTENT:
      """
      ${existingReadme}
      """

      ## UPDATED PROJECT DETAILS:
      - Project Type: ${projectType}
      - Files: ${projectFiles.join("\\n")}
      - Code: ${fullCode.substring(0, 1000)}...
      - Repo URL: ${repoUrl || "Not specified"}

      ## CRITICAL UPDATE RULES:
      1. **PRESERVE CUSTOM CONTENT**: Keep ALL user-written sections, custom badges, personal introductions, custom licensing text, and any content that appears manually added.
      
      2. **UPDATE AUTO-GENERATED SECTIONS**: Only update sections that are clearly auto-generated:
         - Tech stack/technologies list
         - Installation instructions (if they reference old dependencies)
         - API endpoints documentation (if code changed)
         - Features list (if new features detected in code)
         - File structure (if significantly changed)
      
      3. **SMART DETECTION**: Identify custom vs auto-generated content by:
         - Looking for personal writing style or custom formatting
         - Checking if content matches actual code (outdated = auto-generated)
         - Preserving sections with unique badges, custom links, or personal notes
      
      4. **MERGE STRATEGY**:
         - If a section has both custom and auto-generated content, merge them intelligently
         - Keep custom introduction paragraphs
         - Update only the technical details (versions, dependencies, APIs)
         - Preserve custom examples and usage instructions
      
      5. **MAINTAIN STRUCTURE**: Keep the overall README structure and order of sections unless they're clearly outdated
      
      6. **NO EMOJIS**: Do not add any emojis when updating. If the existing README has emojis that the user added, keep them, but don't add new ones.
      
      7. **NATURAL TONE**: Write the Overview section naturally, focusing on what the project does, not the technologies used. Save tech stack details for the "Technologies Used" section.
      
      8. **DOKUGEN BADGE**: Always include this badge at the very bottom:
         [![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)

      ## OUTPUT:
      Generate the UPDATED README that preserves custom content while refreshing auto-generated sections. Do NOT wrap in code blocks.`
              : `Generate a **high-quality, professional, and modern README.md that must impress recruiters and make them hire me** for a **${projectType}** project.
      ## Project Overview:
      The project includes the following files:
      ${projectFiles.join("\\n")}

      ## Full Code Context:
      Below is the actual and compelete source code. So i believe you have 100% of the full code:
      ${fullCode}

      ## README Requirements:
      1. **Title**:
         - Create a clear and professional title for the project. You can find the project title from the metadata files (e.g package.json, go.mod, etc). If you don't find it, come up with a reasonable name. Do NOT add any emojis to the title.

      2. **Description**:
         - Write a short and engaging description of the project that will make it stand out and attract potential users and contributors.

      3. **Installation**:
        ${options.includeSetup === true
                ? `
        - Clone the Repository:
         \`\`\`bash
         git clone ${repoUrl || "<repository-url>"}
         \`\`\`
        - Include step-by-step instructions for setting up the project locally.
        - Use bullet points and code blocks for clarity.
        `
                : "<!-- SKIP SECTION: User opted out of Installation Instructions. DO NOT ADD THIS SECTION. -->"
              }

      4. **Usage**:
         - Include examples and screenshots if available. Check if there are screenshot files in the project (like demo.png, screenshot.png) and include them if found.
         - Add detailed usage instructions. Don't collapse them into expandable sections.

      5. **Features**:
         - Create a list of key features with brief descriptions.

      6. **Technologies Used**:
         - Display a table or grid of technologies with links.
      
      ${options.includeApiDocs === true
                ? `
      7. **API Documentation** (For Backend/Full-Stack Projects):
         - If this is a backend or full-stack project with API endpoints, document ALL endpoints:
         - Use this format for each endpoint:
           #### [HTTP METHOD] [ENDPOINT PATH]
           **Description**: [What this endpoint does]
           
           **Request**:
           \`\`\`json
           {
             "field": "value"
           }
           \`\`\`
           
           **Response**:
           \`\`\`json
           {
             "status": "success",
             "data": {}
           }
           \`\`\`
           
           **Errors**:
           - 400: [Error description]
           - 401: [Error description]
         - Include authentication requirements
         - Document request/response schemas
         - List all environment variables needed
        `
                : "<!-- SKIP SECTION: User opted out of API Documentation. DO NOT ADD THIS SECTION. -->"
              }

      ${options.includeApiDocs === true ? "8" : "7"}. **Contributing**:
         ${options.includeContributionGuideLine === true
                ? `
         - Include guidelines for contributing to the project.
         - Use clean, professional formatting without emojis.
         `
                : "<!-- SKIP SECTION: User Opted out of contributions guidelines. DO NOT ADD THIS SECTION. -->"
              }

      ${options.includeApiDocs === true ? "9" : "8"}. **License**:
         - Include a license section with a link. If the user does not have a LICENSE file in the project files, don't add a license link in the readme.

      ${options.includeApiDocs === true ? "10" : "9"}. **Author Info**:
         - Create a clean author section with social media links.
         ${options.linkedinUrl ? `- LinkedIn: use this exact URL: ${options.linkedinUrl}` : "- LinkedIn: leave a placeholder [Your LinkedIn](https://linkedin.com/in/yourusername)"}
         ${options.twitterUrl ? `- X (Twitter): use this exact URL: ${options.twitterUrl}` : "- X (Twitter): leave a placeholder [@yourhandle](https://x.com/yourhandle)"}

      ${options.includeApiDocs === true ? "11" : "10"}. **Badges**:
          - Add technology badges at the bottom of the README.

      ${options.includeApiDocs === true ? "12" : "11"}. **Dokugen Badge**:
          - Always include this badge at the very bottom of the README:
            \`\`\`
     [![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)
            \`\`\`

      ## Tone and Style:
      - Keep the README clean, professional, and mature.
      - NO EMOJIS - keep it professional and clean.
      - Use natural, conversational language that sounds human-written.
      - Focus on what the project does, not the technologies (save those for the "Technologies Used" section).

      ## Additional Requirements:
      - The README must sound like a human wrote it. Avoid AI-generated phrasing.
      - Write the Overview section naturally, explaining what the project does and what problem it solves.
      - Do NOT wrap the README in markdown code blocks (\`\`\`markdown or \`\`\`).

      ## Final Output:
      Generate the README.md content directly, without any additional explanations or wrapping.
      `;

          const response = ai.models.generateContentStream({
            model: process.env.MODEL_NAME || "gemini-3-pro-preview",
            contents: [
              {
                role: "user",
                parts: [{ text: systemInstruction }],
              },
              {
                role: "model",
                parts: [
                  {
                    text: "Understood. I will follow the Dokugen README generation rules strictly!.",
                  },
                ],
              },
              {
                role: "user",
                parts: [{ text: userPrompt }],
              },
            ],
          });

          return response;
        })(),
      ]);

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      for await (const chunk of result) {
        if (!chunk) continue;
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ response: text })}\n\n`);
        }
      }

      let clientDisconnected = false;
      
      req.on("close", () => {
        clientDisconnected = true;
        logger.warn("Client disconnected during generation.");
      });

      if (!clientDisconnected) {
        res.end();
        logger.info("README Generated Successfully");
      }
    } catch (error: any) {
      console.error("Error:", error);
      res.status(500).json({ error: "error generating readme" });
    }
  },
);

app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || "3000";
app.listen(PORT, () => {
  logger.info(`Dokugen running on port ${PORT}`);
  cron.schedule("*/14 * * * *", () => {
    const keepAliveUrl = `${process.env.BACKEND_DOMAIN}/api/health`
    logger.info(`Performing self-ping to: ${keepAliveUrl}`)
    fetch(keepAliveUrl).then(res => logger.info(`Keep-alive ping successful (Status: ${res.status})`)).catch(err => logger.error("Keep-alive ping failed:", err))
  })
  logger.info("Self-pinger initialized)")
});
