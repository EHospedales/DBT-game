import { getSupabaseServer } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { gameId, prompt } = await req.json()

  const supabase = getSupabaseServer()
  // increment round first
  await supabase.rpc("increment_round", { game_id: gameId })

  // update prompt + phase
  const { error } = await supabase
    .from("games")
    .update({
      prompt,
      phase: "prompt",
    })
    .eq("id", gameId)

  if (error) {
    console.error("Error updating game:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
