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
  baseURL: process.env.OPENAI_ENDPOINT || "https://api.openai.com/v1/chat/completions"
})

/*
TODO: add caching of readme later so i fit improve performance 
const generateCacheKey = (projectType: string, projectFiles: string[], fullCode: string): string => {
  const hash = crypto.createHash("sha256")
  hash.update(projectType + projectFiles.join("") + fullCode)
  return `readme:${hash.digest("hex")}`
} */

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
      1. **Title**:
         - Create a **bold and catchy title** for the project.
      
      2. **Description**:
         - Write a **short and engaging description** of the project.
         - Use **emojis** and **modern formatting** to make it stand out.
      
      3. **Installation**:
         ${options.includeSetup ? `
         - Include **step-by-step instructions** for setting up the project locally.
         - Use **emoji bullet points** and **code blocks** for clarity.
         ` : ""}
      
      4. **Usage**:
         - Include **examples**, **screenshots**, and **code snippets**.
         - Use **collapsible sections** for detailed instructions.
      
      5. **Features**:
         - Create a **list of key features** with **emoji icons** and **brief descriptions**.
      
      6. **Technologies Used**:
         - Display a **table** or **grid** of technologies with **links**.
      
      7. **Contributing**:
         ${options.includeContributionGuideLine ? `
         - Include **guidelines** for contributing to the project.
         - Use **modern formatting** with **emoji bullet points**.
         ` : ""}
      
      8. **License**:
         - Include a **license section** with a **link**.
      
      9. **Author Info**:
         - Create a **modern author section** with **social media links**.
      
      10. **Badges**:
          - Add **dynamic badges** for technologies, build status, and more at the bottom of the README.
      
      11. **Dokugen Badge**:
          - Always include this badge at the **very bottom** of the README:
            \`\`\`
            [![Readme was generated by Dokugen](https://img.shields.io/badge/Built%20with-Dokugen-brightgreen)](https://github.com/samueltuoyo15/Dokugen)
            \`\`\`
      
      ## Tone and Style:
      - If the project is **modern**, use **eye-catching elements** like emojis, badges, and creative formatting.
      - If the project is **professional**, keep the README **clean, concise, and formal**.
      
      ## Additional Requirements:
      - The README must **sound like a human wrote it**. Avoid AI-generated phrasing.
      - Do **not wrap the README in markdown code blocks** (\`\`\`markdown or \`\`\`).
      
      ## Final Output:
      Generate the README.md content directly, without any additional explanations or wrapping.
      `
      
      if (existingReadme) {
        prompt += `\n## Existing README Content:\n${existingReadme}\n`;
      }
    
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    const stream = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || "gpt-4o",
      messages: [
        {
          role: "system", content: `
          You are Dokugen, a professional next generation ultra idolo perfect super README generator powered by AI. Follow these rules strictly:
          1. Always create high-quality, modern, and engaging READMEs.
          2. Use Markdown for formatting.
          3. Include the Dokugen badge at the bottom of the README.
          4. Do not wrap the README in markdown code blocks (```markdown or ```).
          5. Ensure the README sounds like a human wrote it. Avoid AI-generated phrasing.
          `,
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