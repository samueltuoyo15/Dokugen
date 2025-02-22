import type { VercelRequest, VercelResponse } from "@vercel/node"
import { kv } from "@vercel/kv"
import crypto from "crypto"
import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const model = genAI.getGenerativeModel({
  model: process.env.MODEL_NAME || "",
  systemInstruction: process.env.MODEL_INSTRUCTION || "",
})

const generationConfig = process.env.CONFIG_PAYLOAD ? JSON.parse(process.env.CONFIG_PAYLOAD) : {}

const generateCacheKey = (projectType: string, projectFiles: string[], fullCode: string) => {
  const hash = crypto.createHash("sha256")
  hash.update(projectType + projectFiles.join("") + fullCode)
  return `readme:${hash.digest("hex")}`
}


export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { projectType, projectFiles, fullCode, options } = req.body
    if (!projectType || !projectFiles || !fullCode) {
      return res.status(400).json({ error: "Missing required fields in request body" })
    }

    const cacheKey = generateCacheKey(projectType, projectFiles, fullCode)
    const cachedReadme = (await kv.get<string>(cacheKey)) || null

    if (cachedReadme !== null) {
      console.log("♻️ Using cached README from KV Store")
      return res.status(200).json({ readme: cachedReadme })
    }

    console.log("⚡ No cache found. Generating new README...")

    const hasPackageJson = projectFiles.includes("package.json")
    const hasDockerfile = projectFiles.includes("Dockerfile")
    const hasDatabaseConfig = projectFiles.some(file => file.includes("db") || file.includes("database"))
    const hasApiRoutes = projectFiles.some(file => file.includes("routes") || file.includes("api"))

    const hasAPI = hasApiRoutes ? true : false
    const hasDatabase = hasDatabaseConfig ? true : false
    const useDocker = hasDockerfile ? true : false

    const chatSession = model.startChat({ generationConfig })
   
    const prompt = `
    Generate a **high-quality README.md** for a **${projectType}** project.

    ## Project Files:
    The project contains these files:
    ${projectFiles.join("\n")}
    
    ## Full Code Context:
    Below is the **actual source code** from the project:
    ${fullCode}

    ## README Requirements:
    - **Clear & Professional Title**
    - **Short & Precise Project Description**
    - **Installation Steps**
    - **Usage Guide**
    ${hasAPI ? "- **API Endpoints**\n" : ""}
    ${hasDatabase ? "- **Database Setup**\n" : ""}
    ${useDocker ? "- **Docker Setup**\n" : ""}
    - **Contribution Guide**
    - **License Info (if applicable)**
    - **Badges (if applicable)**

    The README must **sound like a human wrote it.**  
    Do **not** say things like "Here is a README for you."
    Do **not** wrap it in markdown code blocks (e.g., \`\`\`markdown or \`\`\`).  
    Just generate the actual **README.md content directly.**
    `

    const result = await chatSession.sendMessage(prompt)
    const readmeContent = result.response.text() || "README generation failed."

    console.log("✅ README Generated Successfully")

    await kv.set(cacheKey, readmeContent, { ex: 3600 }) 

    return res.status(200).json({ readme: readmeContent })
  } catch (error) {
    console.error("❌ Error generating README:", error)
    return res.status(500).json({ error: "Failed to generate README" })
  }
}


const generateCacheKey = (projectType: string, projectFiles: string[], fullCode: string) => {
  const hash = crypto.createHash("sha256")
  hash.update(projectType + projectFiles.join("") + fullCode)
  return `readme:${hash.digest("hex")}`
}

