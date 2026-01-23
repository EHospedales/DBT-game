import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from("games")
      .insert({
        phase: "lobby",
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

    return NextResponse.json({ id: data.id })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error("Create game error:", errorMessage)
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    )
  }
}
