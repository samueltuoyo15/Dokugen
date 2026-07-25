import { Router, Request, Response } from "express";
import sharp from "sharp";
import { getOgInstruction } from "../prompts/ogInstruction";
import logger from "../utils/logger";

const router = Router();

interface OgButton {
  label: string;
  variant?: "primary" | "secondary";
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSvgCard(metadata: {
  title: string;
  tagline?: string;
  techStack?: string[];
  theme?: string;
  url?: string;
  author?: string;
  version?: string;
  logo?: string;
  buttons?: OgButton[];
}): string {
  const title = escapeXml(metadata.title || "My Project");
  const tagline = escapeXml(metadata.tagline || "");
  const buttons = (metadata.buttons || []).slice(0, 2);
  const author = escapeXml(metadata.author || "");
  const url = escapeXml(metadata.url || "");

  // Measure approximate text width for buttons (9px per char + 48px padding)
  const btnMarkup = buttons.map((btn, i) => {
    const label = escapeXml(btn.label);
    const w = Math.max(140, label.length * 10 + 48);
    const x = i === 0 ? 100 : 100 + Math.max(140, (buttons[0]?.label?.length ?? 0) * 10 + 48) + 16;
    const isPrimary = btn.variant === "primary";
    const bg = isPrimary ? "#4F46E5" : "#FFFFFF";
    const stroke = isPrimary ? "#4F46E5" : "#D4D4D8";
    const color = isPrimary ? "#FFFFFF" : "#18181B";
    return `
      <g>
        <rect x="${x}" y="460" width="${w}" height="52" rx="10" fill="${bg}" stroke="${stroke}" stroke-width="1.5"/>
        <text x="${x + w / 2}" y="492" font-family="Inter, Arial, Helvetica, sans-serif" font-size="17" font-weight="600" fill="${color}" text-anchor="middle">${label}</text>
      </g>`;
  }).join("");

  // Footer text
  const footerParts = [url, author ? `by ${author}` : ""].filter(Boolean);
  const footerText = footerParts.join("  •  ");

  // Title - left aligned, large
  // Split title into lines if very long (> 24 chars)
  const words = (metadata.title || "My Project").split(" ");
  const titleLines: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > 20) {
      if (line) titleLines.push(escapeXml(line.trim()));
      line = word;
    } else {
      line = line ? line + " " + word : word;
    }
  }
  if (line) titleLines.push(escapeXml(line.trim()));

  const titleLineHeight = 86;
  const titleYStart = 220;
  const titleMarkup = titleLines.map((l, i) =>
    `<text x="100" y="${titleYStart + i * titleLineHeight}" font-family="Inter, Arial, Helvetica, sans-serif" font-size="80" font-weight="800" fill="#09090B" letter-spacing="-3">${l}</text>`
  ).join("");

  const taglineY = titleYStart + titleLines.length * titleLineHeight + 16;

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#FFFFFF"/>
  <rect x="1" y="1" width="1198" height="628" rx="0" fill="none" stroke="#E4E4E7" stroke-width="2"/>

  ${titleMarkup}

  ${tagline ? `<text x="100" y="${taglineY}" font-family="Inter, Arial, Helvetica, sans-serif" font-size="28" font-weight="400" fill="#71717A" letter-spacing="-0.5">${tagline}</text>` : ""}

  ${btnMarkup}

  ${footerText ? `<text x="100" y="590" font-family="Inter, Arial, Helvetica, sans-serif" font-size="16" font-weight="400" fill="#A1A1AA">${footerText}</text>` : ""}
  <text x="1100" y="590" font-family="Inter, Arial, Helvetica, sans-serif" font-size="13" font-weight="500" fill="#D4D4D8" text-anchor="end">POWERED BY DOKUGEN</text>
</svg>`.trim();
}

router.post("/og-metadata", async (req: Request, res: Response): Promise<any> => {
  try {
    const { summary, apiKey } = req.body;

    if (!summary) {
      return res.status(400).json({ error: "No codebase summary provided." });
    }

    const key = apiKey || process.env.GOOGLE_GEMINI_API_KEY;
    if (!key) {
      return res.status(400).json({ error: "No Google Gemini API Key configured on server." });
    }

    const systemPrompt = getOgInstruction();
    const userPrompt = `Generate the JSON metadata profile for this codebase summary:\n\n${summary}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }, { text: userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title:     { type: "STRING" },
              tagline:   { type: "STRING" },
              techStack: { type: "ARRAY", items: { type: "STRING" } },
              theme:     { type: "STRING", enum: ["light", "dark"] },
              url:       { type: "STRING" },
              author:    { type: "STRING" },
              version:   { type: "STRING" },
              logo:      { type: "STRING" },
              buttons: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    label:   { type: "STRING" },
                    variant: { type: "STRING", enum: ["primary", "secondary"] }
                  },
                  required: ["label", "variant"]
                }
              }
            },
            required: ["title", "tagline", "techStack", "theme", "buttons"]
          }
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error({ status: response.status, error: errText }, "Gemini REST API error for OG metadata");
      return res.status(response.status).json({ error: "Failed to generate metadata profile via Gemini API." });
    }

    const data = await response.json() as any;
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    try {
      const parsed = JSON.parse(rawText.trim());
      // Ensure buttons always has 2 entries as fallback
      if (!parsed.buttons || parsed.buttons.length === 0) {
        parsed.buttons = [
          { label: "Get Started", variant: "primary" },
          { label: "Learn More", variant: "secondary" }
        ];
      }
      return res.status(200).json(parsed);
    } catch (parseErr) {
      logger.error({ rawText, parseErr }, "Failed to parse Gemini response as JSON");
      return res.status(500).json({ error: "Gemini did not return valid JSON. Please try again." });
    }
  } catch (error: any) {
    logger.error(error, "Error in /og-metadata");
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/render-og", async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, tagline, techStack, theme, url, author, version, logo, buttons } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Missing title in render request." });
    }

    const svgString = generateSvgCard({ title, tagline, techStack, theme, url, author, version, logo, buttons });

    const pngBuffer = await sharp(Buffer.from(svgString))
      .png()
      .toBuffer();

    res.setHeader("Content-Type", "image/png");
    return res.status(200).send(pngBuffer);
  } catch (error: any) {
    logger.error(error, "Error in /render-og");
    return res.status(500).json({ error: "Failed to render card image." });
  }
});

export default router;
