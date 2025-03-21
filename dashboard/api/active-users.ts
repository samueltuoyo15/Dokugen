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
  
  try{
    const {data, error } = await supabase.from("active_users").select("id, email, username, usage_count, osInfo").order("usage_count", {ascending: false})
    if(error) throw error
    
    return res.status(200).json({activeUsers: data})
  } catch(error){
    console.error("Error Fetching Active Users", error)
    return res.status(500).json({message: "Failed to fetch active users "})
  }
}