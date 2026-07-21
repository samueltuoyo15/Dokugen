import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config()

const url = (process.env.SUPABASE_CLIENT_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim()
const key = (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim()

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-key"
)