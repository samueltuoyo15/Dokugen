import { supabase } from "../../../lib/supabase.mjs"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  })
}

export async function GET() {
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

    return NextResponse.json({
      totalUsers: count || 0,
      totalGenerations,
      totalReadmes,
      totalCommits,
      totalLicenses,
    }, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      }
    })
  } catch (error) {
    console.error("Error Fetching Stats:", error)
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 })
  }
}
