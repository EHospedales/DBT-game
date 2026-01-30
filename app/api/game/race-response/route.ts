import { getSupabaseServer } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { gameId, playerId, action } = await req.json()

  const supabase = getSupabaseServer()

  // Insert race response
  const { error } = await supabase
    .from("race_responses")
    .insert({
      game_id: gameId,
      player_id: playerId,
      action,
      timestamp: Date.now()
    })

  if (error) {
    console.error("Error inserting race response:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}