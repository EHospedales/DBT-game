import { getSupabaseServer } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

function isMissingRoundColumnError(message?: string) {
  if (!message) return false
  return message.toLowerCase().includes("column") && message.toLowerCase().includes("round")
}

export async function POST(req: Request) {
  const { gameId, playerId, action } = await req.json()
  console.log("Race response API called with:", { gameId, playerId, action })

  const supabase = getSupabaseServer()

  const { data: gameData, error: gameError } = await supabase
    .from("games")
    .select("current_round")
    .eq("id", gameId)
    .single()

  if (gameError) {
    console.error("Error fetching current round for race response:", gameError)
    return NextResponse.json({ error: gameError.message }, { status: 500 })
  }

  const currentRound = gameData?.current_round ?? 0

  // Insert race response
  let { error } = await supabase
    .from("race_responses")
    .insert({
      game_id: gameId,
      player_id: playerId,
      action,
      timestamp: Date.now(),
      round: currentRound,
    })

  if (error && isMissingRoundColumnError(error.message)) {
    console.warn("race_responses.round column missing; retrying insert without round")
    const fallbackResult = await supabase
      .from("race_responses")
      .insert({
        game_id: gameId,
        player_id: playerId,
        action,
        timestamp: Date.now(),
      })
    error = fallbackResult.error
  }

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
  const roundParam = searchParams.get("round")
  const requestedRound = roundParam !== null ? Number(roundParam) : null

  if (!gameId) {
    return NextResponse.json({ error: "Missing gameId" }, { status: 400 })
  }

  if (roundParam !== null && Number.isNaN(requestedRound)) {
    return NextResponse.json({ error: "Invalid round" }, { status: 400 })
  }

  const supabase = getSupabaseServer()

  let query = supabase
    .from("race_responses")
    .select("player_id, action, timestamp, round")
    .eq("game_id", gameId)

  if (requestedRound !== null) {
    query = query.eq("round", requestedRound)
  }

  let { data, error } = await query.order("timestamp", { ascending: true })

  if (error && requestedRound !== null && isMissingRoundColumnError(error.message)) {
    console.warn("race_responses.round column missing; fetching without round filter")
    const fallback = await supabase
      .from("race_responses")
      .select("player_id, action, timestamp")
      .eq("game_id", gameId)
      .order("timestamp", { ascending: true })
    data = fallback.data
    error = fallback.error
  }

  if (error) {
    console.error("Error fetching race responses:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ responses: data || [] })
}