import { VercelRequest, VercelResponse } from "@vercel/node"

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const serverUrl = process.env.SERVER_URL 
    return res.status(200).json({ domain: serverUrl })
  } catch (error) {
    console.error("Error Fetching Server URL", error)
    return res.status(500).json({ message: "Failed to fetch server URL" })
  }
}