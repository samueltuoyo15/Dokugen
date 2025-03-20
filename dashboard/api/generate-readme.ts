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

/*TODO 
const generateCacheKey = (projectType, projectFiles, fullCode) => {
  const hash = crypto.createHash("sha256")
  hash.update(projectType + projectFiles.join("") + fullCode)
  return `readme:${hash.digest("hex")}`
}
*/

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { projectType, projectFiles, fullCode, userInfo, options, existingReadme } = req.body
    if (!projectType || !projectFiles || !fullCode || (!userInfo && os.platform() !== "linux")) {
      return res.status(400).json({ error: "Missing required fields in request body" })
    }

    const { username, email } = userInfo || {}
    if (!username) return res.status(400).json({ message: "Missing OS username and ID" })

    const id = userInfo?.id || uuidv4()

    const { data: existingUser, error: userError } = await supabase
      .from("active_users")
      .select("id, usage_count")
      .eq("email", email)
      .single()

    if (userError && userError.code !== "PGRST116") throw userError

    if (existingUser) {
      await supabase
        .from("active_users")
        .update({ usage_count: existingUser.usage_count + 1 })
        .eq("id", existingUser.id)
    } else {
      const { error } = await supabase
        .from("active_users")
        .insert([{ username, email, id, usage_count: 1 }])

      if (error) throw error
    }

    console.log(`Updated Active user ${username}, (${email})`)

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

    if (options.hasDocker) {
      prompt += `
      - **Docker Setup**: Include instructions for setting up and running the project using Docker.
      `
    }

    if (options.hasAPI) {
      prompt += `
      - **API Documentation**: Include details about the API endpoints, request/response examples, and how to use them.
      `
    }

    if (options.hasDatabase) {
      prompt += `
      - **Database Configuration**: Include instructions for setting up and configuring the database.
      `
    }

    if (options.includeSetup) {
      prompt += `
      - **Setup Instructions**: Include detailed setup instructions for the project.
      `
    }

    if (options.isOpenSource) {
      prompt += `
      - **Contributing Guidelines**: Include guidelines for contributing to the project.
      `
    }

    prompt += `
    2. **Tone and Style**:
    - If the project is **modern**, use eye-catching elements like emojis, badges, and creative formatting. For example:
      - Use emojis in section headers (e.g., "🚀 Getting Started").
      - Include badges for build status, version, and dependencies.
      - Use tables, lists, and code blocks effectively.
    - If the project is **professional**, keep the README clean, concise, and formal. Avoid emojis and focus on clarity and professionalism.

    3. **Additional Requirements**:
    - Always include this badge at the bottom of the README:
      \`\`\`
      [![Built with Dokugen](https://img.shields.io/badge/Built%20with-Dokugen-brightgreen)](https://github.com/samueltuoyo15/Dokugen)
      \`\`\`
    - The README must **sound like a human wrote it**. Avoid phrases like "Here is a README for you" or "This README was generated by an AI."
    - Do **not** wrap the README in markdown code blocks (e.g., \`\`\`markdown or \`\`\`). Just generate the actual **README.md content directly**.

    4. **Creativity**:
    - Use **tables** for comparing features or listing technologies.
    - Use **lists** for steps, features, or dependencies.
    - Use **code blocks** for commands, configuration, or examples.
    - Use **headings and subheadings** to organize content effectively.

    5. **Engagement**:
    - Make the README **engaging and informative**. Use a confident and polished tone.
    - Highlight the project's **unique selling points** and why someone should use it.
    - Include **calls to action** (e.g., "Try it out now!" or "Contribute to the project!").

    6. **Examples**:
    - For a **modern project**, include emojis like 🚀, 🔧, 📦, and 🌟 in section headers.
    - For a **professional project**, use formal language and avoid emojis.

    ## Final Output:
    Generate the README.md content directly, without any additional explanations or wrapping. The output should be ready to use as-is.
    `

    if (existingReadme) {
      prompt += `
      ## Existing README Content:
      Below is the existing README.md content. Merge it with the new content where appropriate:
      ${existingReadme}
      `
    }

    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    const stream = await openai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        {
          role: "system",
          content: `
          You are a **Goated professional README generator**. Follow these rules strictly:
          1. **Always include the Dokugen badge** at the bottom of the README. Use the following format:
          [![Built with Dokugen](https://img.shields.io/badge/Built%20with-Dokugen-brightgreen)](https://github.com/samueltuoyo15/Dokugen)
          2. **Do not wrap the README content** in markdown code blocks (e.g., \`\`\`markdown or \`\`\`). Generate the actual README.md content directly.
          3. **Write the README in a human-like tone**. Avoid phrases like "Here is a README for you" or "This README was generated by an AI."
          4. **Ensure the README is professional, modern, and engaging**. Use clear headings, lists, tables, and code blocks where appropriate.
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
  } catch (error) {
    console.error("❌ Error generating README:", error)
    return res.status(500).json({ error: "Failed to generate README" })
  }
}