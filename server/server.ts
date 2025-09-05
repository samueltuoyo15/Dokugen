import express, { Application, Request, Response } from "express"
import { supabase } from "./supabase"
import os from "os"
import { v4 as uuidv4 } from "uuid"
import { GoogleGenAI } from "@google/genai"
import helmet from "helmet"
import { fetchGitHubReadme } from "./lib/fetchGitHubReadme"
import cors from "cors"
import rateLimit from "express-rate-limit"
import logger from "./utils/logger"
import cron from "node-cron"
import dotenv from "dotenv"
dotenv.config()

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many requests, try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    return req.path === "/health" || req.path === "/api/health"
  }
})

const app: Application = express()

app.set("trust proxy", 1)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["*"],
  credentials: true
}))
app.use(helmet())
app.use(limiter)
app.use(express.json({ limit: "500mb" }))
app.use(express.urlencoded({ limit: "500mb", extended: true }))

const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_GEMINI_API_KEY || ""})

/*
TODO
const generateCacheKey = (projectType: string, projectFiles: string[], fullCode: string) => {
  const hash = crypto.createHash('sha256')
  hash.update(projectType + projectFiles.join('') + fullCode)
  return `readme:${hash.digest('hex')}`
}
*/

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "Ok", uptime: process.uptime(), memoryUsage: process.memoryUsage() })
})

app.post("/api/generate-readme", async (req: Request, res: Response): Promise<any> => {
  try {
    const { projectType, projectFiles, fullCode, userInfo, options = {}, existingReadme, repoUrl, customReadmeFormat } = req.body
    logger.info(req.body)

    if (!projectType || !projectFiles || !fullCode || (!userInfo && os.platform() !== "linux")) {
      return res.status(400).json({ error: "Missing required fields in request body" })
    }

    let formatTemplate = ""
    if (customReadmeFormat) {
      formatTemplate = await fetchGitHubReadme(customReadmeFormat)
    }

    const { username, email, osInfo } = userInfo || {}
    if (!username) return res.status(400).json({ message: "Missing OS username and ID" })

    const id = userInfo?.id || uuidv4()

    const [_, result] = await Promise.all([(async () => {
      if (!email) return
      const { data: existingUser, error: userError } = await supabase.from("active_users").select("id, usage_count").eq("email", email).single()
      if (userError && userError.code !== "PGRST116") throw userError
      if (existingUser) {
        const updateData: { usage_count: number; osInfo?: string } = { usage_count: existingUser.usage_count + 1 }
        if (osInfo) updateData.osInfo = osInfo
        await supabase.from("active_users").update(updateData).eq("id", existingUser.id)
      } else {
        await supabase.from("active_users").insert([{ username, email, id, osInfo, usage_count: 1 }])
      }
      logger.info(`Updated Active user ${username}, ${email} (${osInfo})`)
    })(),

    (async () => {
      const systemInstruction = `
      # Dokugen Backend Documentation Specialist
      
      ## Core Principle
      When you detect a backend project (API servers, databases, authentication systems), 
      use THIS EXACT TEMPLATE STRUCTURE with technical precision:
    
      """
      # [ProjectName] API
    
      ## Overview
      [1-2 sentence technical description mentioning key frameworks/languages]
      
      ## Features
      - [Technology]: [Purpose]
      - [Technology]: [Purpose]
    
      ## Getting Started
      ### Installation
      [Step-by-step commands]
      
      ### Environment Variables
      [List ALL required variables with examples]
    
      ## API Documentation
      ### Base URL
      [API root path]
    
      ### Endpoints
      #### [HTTP METHOD] [ENDPOINT PATH]
      **Request**:
      [Payload structure with required fields]
      
      **Response**:
      [Success response example]
      
      **Errors**:
      - [HTTP Status]: [Error scenario]
      """
    
      ## Mandatory Rules
      1. Detection:
         - Analyze code for API patterns (routes, controllers, models)
         - Identify database/auth systems
    
      2. Documentation:
         ✓ All endpoints documented!!! Please obey this!!!!!!
         ✓ Do not wrap the entire documented part of the readme in a detail and summary tag!!!!!!
         ✓ Exact request/response schemas. Please always do this, do not forget to do this Please !!!
         ✓ Environment variables with examples
         ✓ Error codes and meanings
         ✓ Zero emojis or promotional language

         So Please this is just a sample of what am expecting you to do strictly please!!!
         '**User Registration:**
          POST /api/v1/auth/register
          _Body Example:_
          json
          {
            "full_name": "John Doe",
            "username": "johndoe",
            "email": "john.doe@example.com",
            "phone": "08012345678",
            "address": "123 Main St, City",
            "password": "StrongPassword123",
            "referral_username": "referrer_user"
          }'
    
      3. For non-backend projects:
         - Use standard formatting (dont bloat the readme emojis please. If you want to add emojis just add one or two and make sure it matches the text that you are adding it next to, if there's any screenshots you can add then add if not skip it, etc.)
         - Include Dokugen badge always!!!
    
      4. Universal:
         - Never wrap in code blocks (\`\`\`markdown)
         - Sound human-written
         - Use Markdown formatting
      `

      const userPrompt = formatTemplate ? `
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
        : `Generate a **high-quality, professional, and modern README.md that must impress recruiters and make them hire me** for a **${projectType}** project.
      ## Project Overview:
      The project includes the following files:
      ${projectFiles.join("\n")}
      
      ## Full Code Context:
      Below is the actual and compelete source code. So i believe you have 100% of the full code:
      ${fullCode}
          
      ## README Requirements:
      1. **Title**:
         - Create a **bold and catchy title** for the project. You can find the project title from maybe the meta data file of the project files (e.g package.json go.mod e.t.c) if you dont find it, then come up with a human reasonable name Please avoid emojis please. If you want to add emojis to the title then add just one, and that one emoji should match what the title is all about. Dont just use stupid emoji if you dont have any emoji that matches the title then dont add.
      
      2. **Description**:
         - Write a **short and engaging description** of the project.
         - Use **emojis** and **modern formatting** to make it stand out. But dont bloat the the description with too much emojis.
     
      3. **Installation**:
        ${options.includeSetup ? `
        - **Clone the Repository**:
         \`\`\`bash
         git clone ${repoUrl || "<repository-url>"}
         \`\`\`
        - Include **step-by-step instructions** for setting up the project locally.
        - Use **emoji bullet points** and **code blocks** for clarity.
        ` : "<!-- SKIP SECTION: User opted out of Installation Instructions -->"}
  
      4. **Usage**:
         - Include **examples**, **screenshots**, and if theres not screenshot dont add please, you can actually check if theres any file like screenshot png file or something realted iin the project files, u can add it.
         - Please add detailed instructions usage dont collapse them ooo please!!.
      
      5. **Features**:
         - Create a **list of key features** with a **brief descriptions**.
      
      6. **Technologies Used**:
         - Display a **table** or **grid** of technologies with **links** please dont bloat it with too much emojis or unnecessary emojis.
      
      7. **Contributing**:
         ${options.includeContributionGuideLine ? `
         - Include **guidelines** for contributing to the project.
         - Use **modern formatting** with **emoji bullet points**.
         ` : "<!-- SKIP SECTION: User Opted out of contributions guidelines -->"}
      
      8. **License**:
         - Include a **license section** with a **link**, please if the user does not have a LISCENSE file in the project files dont add a liscense link in the readme.
      
      9. **Author Info**:
         - Create a **modern author section** with **social media links expect github link. Please dont guess authors links if you dont know their username just leave placeholders for them to write theirselves**.
      
      10. **Badges**:
          - Add **dynamic badges** for technologies, build status, and more at the bottom of the README.
      
      11. **Dokugen Badge**:
          - Always include this badge at the **very bottom** of the README:
            \`\`\`
     [![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)
            \`\`\`
      
      ## Tone and Style:
      - If the project is **modern**, use **eye-catching elements** like emojis, but not too much ooo! please let the readme be matured not packed with unnecessary emojis!!!, badges, and creative formatting.
      - If the project is **professional**, keep the README **clean, concise, and formal**.
      
      ## Additional Requirements:
      - The README must **sound like a human/graduate wrote it 100%**. Avoid AI-generated phrasing please!!.
      - Do **not wrap the README in markdown code blocks** (\`\`\`markdown or \`\`\`).
      
      ## Final Output:
      Generate the README.md content directly, without any additional explanations or wrapping.
      `

      const response = ai.models.generateContentStream({
        model: process.env.MODEL_NAME || "gemini-2.0-flash-001",
        contents: [
          {
            role: "user",
            parts: [{ text: systemInstruction }]
          },
          {
            role: "model", 
            parts: [{ text: "Understood. I will follow the Dokugen README generation rules strictly." }]
          },
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ]
      })

      return response
    })()
    ])

    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    for await (const chunk of result) {
      if (!chunk) continue
      const text = chunk.text
      if (text) {
        res.write(`data: ${JSON.stringify({ response: text })}\n\n`)
      }
    }

    req.on("close", () => {
      logger.warn("Client disconnected during generation.")
    })

    res.end()
    logger.info("README Generated Successfully")
  } catch (error: any) {
    console.error("Error:", error)
    res.status(500).json({ error: "error generating readme" })
  }
})

app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err)
  res.status(500).json({ error: "Internal Server Error" })
})

const PORT = process.env.PORT || "3000"
app.listen(PORT, () => {
  logger.info(`Dokugen running on port ${PORT}`)
  cron.schedule("*/14 * * * *", () => {
    const keepAliveUrl = `${process.env.BACKEND_DOMAIN}/api/health`
    logger.info(`Performing self-ping to: ${keepAliveUrl}`)
    fetch(keepAliveUrl).then(res => logger.info(`Keep-alive ping successful (Status: ${res.status})`)).catch(err => logger.error("Keep-alive ping failed:", err))
  })
  logger.info("Self-pinger initialized)")
})