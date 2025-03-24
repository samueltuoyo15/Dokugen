import { supabase } from "../lib/supabase.mjs"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import crypto from "crypto"
import os from "os"
import { v4 as uuidv4 } from "uuid"
import { OpenAI } from "openai"
import dotenv from "dotenv"
dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  baseURL: process.env.OPENAI_ENDPOINT || "https://api.openai.com/v1/chat/completions"
})

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
    const { projectType, projectFiles, fullCode, userInfo, options, existingReadme, repoUrl} = req.body
    console.log(req.body)
    if (!projectType || !projectFiles || !fullCode || (!userInfo && os.platform() !== "linux")) {
      return res.status(400).json({ error: "Missing required fields in request body" })
    }

    const { username, email, osInfo } = userInfo || {}
    if (!username) return res.status(400).json({ message: "Missing OS username and ID" })

    const id = userInfo?.id || uuidv4()

    const { data: existingUser, error: userError } = await supabase.from("active_users").select("id, usage_count").eq("email", email).single()

    if (userError && userError.code !== "PGRST116") throw userError

    if (existingUser) {
      const updateData: any = { usage_count: existingUser.usage_count + 1 }
      if (osInfo) updateData.osInfo = osInfo

      await supabase.from("active_users").update(updateData).eq("id", existingUser.id)
    } else {
      const { error } = await supabase
        .from("active_users")
        .insert([{ username, email, id, osInfo, usage_count: 1 }])

      if (error) throw error
    }

    console.log(`Updated Active user ${username}, ${email} (${osInfo})`)
    let prompt = `
    Generate an ULTRA-MODERN, visually stunning README.md for a ${projectType} project that'll make other devs say "I need this NOW!". 
    
    ## Project DNA:
    - Project Type: ${projectType}
    - Key Files: ${projectFiles.join(", ")}
    ${repoUrl ? `- Repo URL: ${repoUrl}` : ''}
    
    ## README Requirements (Next-Level Edition):
    1. **HEADER (Make it POP)**:
       - Viral-worthy title with custom emoji combo
       - Description that gets 1000+ stars
       - Dynamic badges (version, downloads, license)
    
    2. **Features Section (Show Off)**:
       - Emoji-powered feature grid with hover effects
       - 3D/floating effect suggestions in comments
       ${options.includeSetup ? `
    3. **Installation (Sleek AF)**:
       - Clone command with repo URL ${repoUrl ? `(\`${repoUrl}\`)` : ''}
       - One-line installer if possible
       - Terminal animation suggestions
       - Neofetch-style system info` : ''}
    
    4. **Usage (Interactive Feel)**:
       - GIF/video placeholder suggestions
       - Tabbed code examples
       - "Try Me" badge linking to live demo
    
    5. **Tech Stack (Future-Proof)**:
       - Glowing tech logos with percentage bars
       - "Why We Chose These" hover tooltips
    
    ${options.includeContributionGuideLine ? `
    6. **Contributing (Community Focus)**:
       - Discord/community badges
       - First-timer friendly labels
       - Gamified contribution tiers` : ''}
    
    7. **License & Footer (Clean)**:
       - Glowing license badge
       - Minimalist footer
       - MUST include Dokugen badge
    
    ## Tone:
    - 3030 futuristic but not cringe
    - Professional but viral-friendly
    - Human-written feel (no AI tells)
    
    ## Formatting Rules:
    - NO raw code dumps
    - NO package.json unless critical
    - MAXIMUM visual hierarchy
    - MUST include:
      - 3 custom emoji combos 
      - 2 dynamic badges
      - 1 interactive element suggestion
      ${repoUrl ? '- Proper repo URL integration' : ''}
      ${options.includeSetup ? '- Clear setup instructions' : ''}
      ${options.includeContributionGuideLine ? '- Engaging contribution guide' : ''}
      - The Dokugen badge (bottom)
    
    ## Special Effect Zones:
    <!-- [GLOW EFFECT: Use around main title] -->
    <!-- [TYPING ANIMATION: Installation code block] -->
    <!-- [3D CARD: Features section] -->
    `
    
    if (existingReadme) {
      prompt += `\n## Existing README to Level Up:\n${existingReadme}\n`;
    }
    
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    const stream = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
          You are Dokugen, a professional next generation ultra idolo perfect super README generator powered by AI. Follow these rules strictly:
          1. Always create high-quality, modern, and engaging READMEs.
          2. Use Markdown for formatting.
          3. Include the Dokugen badge at the bottom of the README.
          4. Do not wrap the README in markdown code blocks (\`\`\`markdown or \`\`\`).
          5. Ensure the README sounds like a human wrote it. Avoid AI-generated phrasing.
          `,
        },
        { role: "user", content: prompt },
      ],
      stream: true,
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




