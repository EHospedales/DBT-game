import { getSupabaseServer } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { gameId, playerId, action } = await req.json()
  console.log("Race response API called with:", { gameId, playerId, action })

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

  console.log("Successfully inserted race response")
  return NextResponse.json({ ok: true })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const gameId = searchParams.get("gameId")

  if (!gameId) {
    return NextResponse.json({ error: "Missing gameId" }, { status: 400 })
  }

  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from("race_responses")
    .select("player_id, action, timestamp")
    .eq("game_id", gameId)
    .order("timestamp", { ascending: true })

  if (error) {
    console.error("Error fetching race responses:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ responses: data || [] })
}