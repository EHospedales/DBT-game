import { getSupabaseServer } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { gameId, playerId, raceResponseId, isFavoriting } = await req.json()

  const supabase = getSupabaseServer()

  try {
    if (isFavoriting) {
      // Add favorite
      await supabase.from("race_response_favorites").insert({
        game_id: gameId,
        player_id: playerId,
        race_response_id: raceResponseId,
      })
    } else {
      // Remove favorite
      await supabase
        .from("race_response_favorites")
        .delete()
        .eq("game_id", gameId)
        .eq("player_id", playerId)
        .eq("race_response_id", raceResponseId)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error updating race favorite:", error)
    return NextResponse.json({ error: "Failed to update favorite" }, { status: 500 })
  }
}

// Get favorites for race responses in a game
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const gameId = searchParams.get("gameId")
  const playerId = searchParams.get("playerId")

  if (!gameId) {
    return NextResponse.json({ error: "Missing gameId" }, { status: 400 })
  }

  const supabase = getSupabaseServer()

  try {
    let query = supabase
      .from("race_response_favorites")
      .select("race_response_id, player_id")
      .eq("game_id", gameId)

    if (playerId) {
      query = query.eq("player_id", playerId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ favorites: data || [] })
  } catch (error) {
    console.error("Error fetching race favorites:", error)
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
  }
}