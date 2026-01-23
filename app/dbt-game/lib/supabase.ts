import { createClient } from "@supabase/supabase-js"

let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      throw new Error(
        "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
      )
    }

    supabaseInstance = createClient(url, key)
  }

  return supabaseInstance
}

// For SSR-safe access, lazy-load on first use
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    return (getSupabase() as any)[prop]
  },
})