import { supabase } from "../lib/supabase.ts"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import crypto from "crypto"
import os from "os"
import { OpenAI } from 'openai'
import dotenv from "dotenv"

dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
    baseURL: process.env.OPENAI_ENDPOINT || ""
});

const MODEL_INSTRUCTION = process.env.MODEL_INSTRUCTION?.trim() || ""

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
    const { projectType, projectFiles, fullCode, userInfo } = req.body
    if (!projectType || !projectFiles || !fullCode || (!userInfo && os.platform() !== "linux")) {
      return res.status(400).json({ error: "Missing required fields in request body" })
    }
 
    const { username, email, id } = userInfo || {}
    if(!username || !id) return res.status(400).json({message: "missing os username and id"})
    const { data, error } = await supabase
      .from("active_users")
      .upsert([{ username, email, id }], { onConflict: "id" })
      .select("usage_count")
      .single()

    if (error) throw error

    const usage_count = data?.usage_count || 0

    if (data) {
      await supabase.from("active_users").update({ usage_count: usage_count + 1 }).eq("id", id)
    }

    console.log(`Updated Active user ${username}, (${email})`)


    const hasAPI = projectFiles.some((file: string)  => file.includes("routes") || file.includes("api"))
    const hasDatabase = projectFiles.some((file: string) => file.includes("db") || file.includes("database"))
    const useDocker = projectFiles.includes("Dockerfile")

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
    
    ## Additional Requirement:
    - At the bottom of the README, you must always include the following badge:

    \`\`\`
    [![Built with Dokugen](https://img.shields.io/badge/Built%20with-Dokugen-brightgreen)](https://github.com/samueltuoyo15/Dokugen)
    \`\`\`
    
    The README must **sound like a human wrote it.**  
    Do **not** say things like "Here is a README for you."
    Do **not** wrap it in markdown code blocks (e.g., \`\`\`markdown or \`\`\`).  
    Just generate the actual **README.md content directly.**
    `

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const stream = await openai.chat.completions.create({
      model: process.env.MODEL_NAME!,
      messages: [
        { role: 'system', content: MODEL_INSTRUCTION },
        { role: 'user', content: prompt },
      ],
      stream: true,
    })

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || ''
      if (text) {
        res.write(`data: ${JSON.stringify({ response: text })}\n\n`)
      }
    }

    res.end()
    console.log("✅ README Generated Successfully")
  } catch (error) {
    console.error("❌ Error generating README:", error)
    return res.status(500).json({ error: "Failed to generate README" })
  }
}