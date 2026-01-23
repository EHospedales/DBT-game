import { createClient } from "@supabase/supabase-js"

let supabaseServerInstance: any = null

export function getSupabaseServer() {
  if (!supabaseServerInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error(
        "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
      )
    }

    supabaseServerInstance = createClient(url, key, { auth: { persistSession: false } })
  }

  return supabaseServerInstance
}
