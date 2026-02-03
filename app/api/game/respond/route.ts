import { getSupabaseServer } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { gameId, playerId, mindState, reflection } = await req.json()

  const supabase = getSupabaseServer()

  // Fetch current round from game
  const { data: gameData, error: gameError } = await supabase
    .from("games")
    .select("current_round")
    .eq("id", gameId)
    .single()

  if (gameError) {
    console.error("Error fetching game round:", gameError)
    return NextResponse.json({ error: gameError.message }, { status: 500 })
  }

  const currentRound = gameData?.current_round || 0

  await supabase
    .from("responses")
    .insert({
      game_id: gameId,
      player_id: playerId,
      round: currentRound,
      mind_state: mindState,
      text_response: reflection,
    })

  return NextResponse.json({ ok: true })
}
