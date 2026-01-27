import { getSupabaseServer } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { gameId, playerId, responseId, isFavoriting } = await req.json()

  const supabase = getSupabaseServer()

  try {
    if (isFavoriting) {
      // Add favorite
      await supabase.from("favorites").insert({
        game_id: gameId,
        player_id: playerId,
        response_id: responseId,
      })
    } else {
      // Remove favorite
      await supabase
        .from("favorites")
        .delete()
        .eq("game_id", gameId)
        .eq("player_id", playerId)
        .eq("response_id", responseId)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error updating favorite:", error)
    return NextResponse.json({ error: "Failed to update favorite" }, { status: 500 })
  }
}

// Get favorites for a game
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
      .from("favorites")
      .select("response_id, player_id, count(response_id)")
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
    console.error("Error fetching favorites:", error)
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
  }
}
