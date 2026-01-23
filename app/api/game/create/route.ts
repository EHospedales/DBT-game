import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"

export async function POST(req: Request) {
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
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}
