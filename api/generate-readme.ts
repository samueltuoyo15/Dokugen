import { VercelRequest, VercelResponse } from "@vercel/node"
import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const model = genAI.getGenerativeModel({
  model: process.env.MODEL_NAME || "",
  systemInstruction: process.env.MODEL_INSTRUCTION || "",
})

const generationConfig = process.env.CONFIG_PAYLOAD ? JSON.parse(process.env.CONFIG_PAYLOAD) : ""

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { projectType, projectFiles, fullCode, options } = req.body

    const filesList = Array.isArray(projectFiles) ? projectFiles.join("\n") : "No files provided"
    const hasAPI = options?.hasAPI ? "- **API Endpoints**\n" : ""
    const hasDatabase = options?.hasDatabase ? "- **Database Setup**\n" : ""
    const useDocker = options?.useDocker ? "- **Docker Setup**\n" : ""

    const chatSession = model.startChat({ generationConfig })
    const prompt = `
    Generate a **high-quality README.md** for a **${projectType}** project.
  
    ## Project Files:
    The project contains these files:
    ${filesList}
  
    ## Full Code Context:
    Below is the **actual source code** from the project:
    ${fullCode}
  
    ## README Requirements:
    - **Clear & Professional Title**
    - **Short & Precise Project Description**
    - **Installation Steps**
    - **Usage Guide**
    ${hasAPI}
    ${hasDatabase}
    ${useDocker}
    - **Contribution Guide**
    - **License Info (if applicable)**
    - **Badges (if applicable)**
  
    The README must **sound like a human wrote it.**  
    Do **not** say things like "Here is a README for you."
    Do **not** wrap it in markdown code blocks (e.g., \`\`\`markdown or \`\`\`).  
    Just generate the actual **README.md content directly.**
    `

    const result = await chatSession.sendMessage(prompt)
    const readmeContent = result.response.text() || "FAILED TO CREATE README"
    
    return res.status(200).json({ readme: readmeContent })
  } catch (error) {
    console.error("❌ Error generating README:", error)
    return res.status(500).json({ error: "Failed to generate README" })
  }
}