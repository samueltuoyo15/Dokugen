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
    const serverUrl = process.env.SERVER_URL
    return NextResponse.json({ domain: serverUrl }, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    })
  } catch (error) {
    console.error("Error Fetching Server URL", error)
    return NextResponse.json({ message: "Failed to fetch server URL" }, { status: 500 })
  }
}
