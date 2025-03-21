import { supabase } from "../lib/supabase.mjs"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import crypto from "crypto"
import os from "os"
import { v4 as uuidv4 } from "uuid"
import { OpenAI } from 'openai'
import dotenv from "dotenv"

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  baseURL: process.env.OPENAI_ENDPOINT || ""
})

const generateCacheKey = (projectType: string, projectFiles: string[], fullCode: string): string => {
  const hash = crypto.createHash("sha256")
  hash.update(projectType + projectFiles.join("") + fullCode)
  return `readme:${hash.digest("hex")}`
}

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { projectType, projectFiles, fullCode, userInfo, options, existingReadme } = req.body

    if (!projectType || !projectFiles || !fullCode || (!userInfo && os.platform() !== "linux")) {
      return res.status(400).json({ error: "Missing required fields in request body" })
    }

    const { username, email, osInfo } = userInfo || {}
    if (!username) return res.status(400).json({ message: "Missing OS username and ID" })

    const id = userInfo?.id || uuidv4()

    const { data: existingUser, error: userError } = await supabase
      .from("active_users")
      .select("id, usage_count")
      .eq("email", email)
      .single()

    if (userError && userError.code !== "PGRST116") throw userError

    if (existingUser) {
      const updateData: any = { usage_count: existingUser.usage_count + 1 }
      if (osInfo) updateData.osInfo = osInfo 

      await supabase
        .from("active_users")
        .update(updateData)
        .eq("id", existingUser.id)
    } else {
      const { error } = await supabase
        .from("active_users")
        .insert([{ username, email, id, osInfo, usage_count: 1 }])

      if (error) throw error
    }

    console.log(`Updated Active user ${username}, (${email}) ${osInfo || "No OS Info"}`)

    let prompt = `
    Generate a **high-quality, professional, and modern README.md** for a **${projectType}** project.

    ## Project Overview:
    The project includes the following files:
    ${projectFiles.join("\n")}

    ## Full Code Context:
    Below is the actual source code:
    ${fullCode}

    ## README Requirements:
    1. **Analyze the project** and determine what sections are needed. Include the following sections if applicable:
    - **Title**: A clear and concise title for the project.
    - **Description**: A brief but engaging description of the project. Highlight its purpose, key features, and benefits.
    - **Installation**: Step-by-step instructions for setting up the project locally. Include commands, dependencies, and any configuration steps.
    - **Usage**: Clear instructions on how to use the project. Include examples, screenshots, or code snippets where applicable.
    - **Features**: A list of key features with brief descriptions.
    - **Technologies Used**: A list of technologies, frameworks, and tools used in the project.
    - **Contributing**: Guidelines for contributing to the project. Include instructions for setting up the development environment and submitting pull requests.
    - **License**: Information about the project's license (if applicable).
    `

    if (options?.hasDocker) {
      prompt += `- **Docker Setup**: Include instructions for setting up and running the project using Docker.\n`
    }

    if (options?.hasAPI) {
      prompt += `- **API Documentation**: Include details about the API endpoints, request/response examples, and how to use them.\n`
    }

    if (options?.hasDatabase) {
      prompt += `- **Database Configuration**: Include instructions for setting up and configuring the database.\n`
    }

    if (options?.includeSetup) {
      prompt += `- **Setup Instructions**: Include detailed setup instructions for the project.\n`
    }

    if (options?.isOpenSource) {
      prompt += `- **Contributing Guidelines**: Include guidelines for contributing to the project.\n`
    }

    prompt += `
    2. **Tone and Style**:
    - If the project is **modern**, use eye-catching elements like emojis, badges, and creative formatting.
    - If the project is **professional**, keep the README clean, concise, and formal.

    3. **Additional Requirements**:
    - Always include this badge at the bottom of the README:
      \`\`\`
      [![Built with Dokugen](https://img.shields.io/badge/Built%20with-Dokugen-brightgreen)](https://github.com/samueltuoyo15/Dokugen)
      \`\`\`
    - The README must **sound like a human wrote it**. Avoid AI-generated phrasing.
    - Do **not** wrap the README in markdown code blocks (\`\`\`markdown or \`\`\`).

    ## Final Output:
    Generate the README.md content directly, without any additional explanations or wrapping.
    `

    if (existingReadme) {
      prompt += `\n## Existing README Content:\n${existingReadme}\n`
    }
    
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    const stream = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
          You are a **Goated professional README generator**. Follow these rules strictly:
          1. **Always include the Dokugen badge** at the bottom.
          2. **Do not wrap the README content** in markdown code blocks.
          3. **Ensure the README is professional, modern, and engaging**.
          `
        },
        { role: "user", content: prompt }
      ],
      stream: true
    })

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || ""
      if (text) {
        res.write(`data: ${JSON.stringify({ response: text })}\n\n`)
      }
    }

    res.end()
    console.log("✅ README Generated Successfully")
  } catch (error: any) {
    console.error("❌ Error generating README:", error)
    return res.status(500).json({ error: error.message || "Failed to generate README" })
  }
}