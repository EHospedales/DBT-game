import { getSupabaseServer } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { gameId, playerId, mindState, reflection } = await req.json()

  const supabase = getSupabaseServer()

  // Fetch current round and prompt from game
  const { data: gameData, error: gameError } = await supabase
    .from("games")
    .select("current_round, prompt")
    .eq("id", gameId)
    .single()

  if (gameError) {
    console.error("Error fetching game data:", gameError)
    return NextResponse.json({ error: gameError.message }, { status: 500 })
  }

  const currentRound = gameData?.current_round || 0
  const prompt = gameData?.prompt || ""

  await supabase
    .from("responses")
    .insert({
      game_id: gameId,
      player_id: playerId,
      round: currentRound,
      prompt: prompt,
      mind_state: mindState,
      text_response: reflection,
    })

  return NextResponse.json({ ok: true })
}
