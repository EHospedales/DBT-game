import { getSupabaseServer } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { gameId, playerId, mindState, reflection } = await req.json()

  const supabase = getSupabaseServer()
  await supabase
    .from("responses")
    .insert({
      game_id: gameId,
      player_id: playerId,
      mind_state: mindState,
      text_response: reflection,
    })

  return NextResponse.json({ ok: true })
}
