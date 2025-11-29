import { supabase } from "../lib/supabase.mjs"
import { VercelRequest, VercelResponse } from "@vercel/node"

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  
  if(req.method === "OPTIONS"){
    return res.status(200).end()
  }
  
  if(req.method !== "GET"){
    return res.status(405).json({message: "Method not allowed "})
  }
  
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit - 1
  
  try{
    const { data, error, count } = await supabase
      .from("active_users")
      .select("id, username, usage_count, osInfo", { count: 'exact' })
      .order("usage_count", { ascending: false })
      .range(startIndex, endIndex)
    
    if(error) throw error
    
    const totalPages = Math.ceil((count || 0) / limit)
    
    return res.status(200).json({
      activeUsers: data,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalUsers: count,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch(error){
    console.error("Error Fetching Active Users", error)
    return res.status(500).json({message: "Failed to fetch active users "})
  }
}