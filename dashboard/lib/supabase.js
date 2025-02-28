const { createClient } = require("@supabase/supabase-js")
const dotenv = require("dotenv").config()

const supabase = createClient(process.env.SUPABASE_CLIENT_URL, process.env.SUPABASE_ANON_KEY)

module.exports = { supabase }