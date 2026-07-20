import { supabase } from "../../../lib/supabase.mjs"
import { NextRequest, NextResponse } from "next/server"

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const sortBy = searchParams.get("sortBy") || "usage_count"

  const allowedSorts = ["usage_count", "readme_usage", "commit_usage", "license_usage", "revert_usage"]
  const sortColumn = allowedSorts.includes(sortBy) ? sortBy : "usage_count"

  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit - 1

  try {
    const { data, error, count } = await supabase
      .from("active_users")
      .select("username, usage_count, readme_usage, commit_usage, license_usage, revert_usage", { count: 'exact' })
      .order(sortColumn, { ascending: false })
      .range(startIndex, endIndex)

    if (error) throw error

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      activeUsers: data,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalUsers: count,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    })
  } catch (error) {
    console.error("Error Fetching Active Users", error)
    return NextResponse.json({ message: "Failed to fetch active users" }, { status: 500 })
  }
}
