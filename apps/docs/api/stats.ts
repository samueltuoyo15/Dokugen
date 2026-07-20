import { supabase } from "../lib/supabase.mjs"
import { VercelRequest, VercelResponse } from "@vercel/node"

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { data, error, count } = await supabase
      .from("active_users")
      .select("usage_count, readme_usage, commit_usage, license_usage, revert_usage", { count: "exact" })

    if (error) throw error

    let totalGenerations = 0
    let totalReadmes = 0
    let totalCommits = 0
    let totalLicenses = 0

    if (data) {
      for (const row of data) {
        totalGenerations += row.usage_count || 0
        totalReadmes += row.readme_usage || 0
        totalCommits += row.commit_usage || 0
        totalLicenses += row.license_usage || 0
      }
    }

    return res.status(200).json({
      totalUsers: count || 0,
      totalGenerations,
      totalReadmes,
      totalCommits,
      totalLicenses,
    })
  } catch (error) {
    console.error("Error Fetching Stats:", error)
    return res.status(500).json({ message: "Failed to fetch stats" })
  }
}
