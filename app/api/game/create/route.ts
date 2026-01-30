import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from("games")
      .insert({
        phase: "lobby",
        mode: "reflection",
        scores: {},
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json(
        { ok: false, error: error.message, details: error },
        { status: 500 }
      )
    }

    if (!data) {
      console.error("No data returned from insert")
      return NextResponse.json(
        { ok: false, error: "No data returned from insert" },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: data.id, ok: true })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error("Create game error:", errorMessage)
    console.error("Environment check - NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "MISSING")
    console.error("Environment check - SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "MISSING")
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    )
  }
}
