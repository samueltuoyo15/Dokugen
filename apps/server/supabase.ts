import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.SUPABASE_CLIENT_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase environment variables: SUPABASE_CLIENT_URL and SUPABASE_SECRET_KEY (or SUPABASE_PUBLISHABLE_KEY) are required.");
}

export const supabase: SupabaseClient = createClient(url, key);
