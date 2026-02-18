import { getSupabaseServer } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

type PlayerRow = {
  id: string
  name: string
}

type ResponseRow = {
  id: string
  player_id: string
}

type FavoriteRow = {
  response_id: string
}

type RaceFavoriteRow = {
  race_response_id: string
}

function parseRaceResponsePlayerId(raceResponseId: string): string | null {
  const match = /^race-(.+)-(\d+)$/.exec(raceResponseId)
  return match ? match[1] : null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const namesParam = searchParams.get("playerNames")

  if (!namesParam) {
    return NextResponse.json({ stats: {} })
  }

  const requestedNames = namesParam
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)

  if (requestedNames.length === 0) {
    return NextResponse.json({ stats: {} })
  }

  const supabase = getSupabaseServer()

  const { data: playersData, error: playersError } = await supabase
    .from("players")
    .select("id, name")

  if (playersError) {
    console.error("Error fetching players for leaderboard stats:", playersError)
    return NextResponse.json({ error: playersError.message }, { status: 500 })
  }

  const players = (playersData || []) as PlayerRow[]
  const requestedNameSet = new Set(requestedNames)

  const trackedPlayers = players.filter((player) => requestedNameSet.has(player.name))
  const trackedPlayerIds = new Set(trackedPlayers.map((player) => player.id))

  const heartsByName: Record<string, number> = {}
  for (const name of requestedNames) {
    heartsByName[name] = 0
  }

  if (trackedPlayerIds.size === 0) {
    return NextResponse.json({ stats: heartsByName })
  }

  const trackedResponsePlayerIds = Array.from(trackedPlayerIds)

  const { data: responsesData, error: responsesError } = await supabase
    .from("responses")
    .select("id, player_id")
    .in("player_id", trackedResponsePlayerIds)

  if (responsesError) {
    console.error("Error fetching responses for leaderboard stats:", responsesError)
    return NextResponse.json({ error: responsesError.message }, { status: 500 })
  }

  const responses = (responsesData || []) as ResponseRow[]
  const responseOwnerById = new Map<string, string>()
  for (const response of responses) {
    responseOwnerById.set(response.id, response.player_id)
  }

  const { data: favoritesData, error: favoritesError } = await supabase
    .from("favorites")
    .select("response_id")

  if (favoritesError) {
    console.error("Error fetching favorites for leaderboard stats:", favoritesError)
    return NextResponse.json({ error: favoritesError.message }, { status: 500 })
  }

  const heartsByPlayerId: Record<string, number> = {}
  for (const favorite of (favoritesData || []) as FavoriteRow[]) {
    const ownerId = responseOwnerById.get(favorite.response_id)
    if (!ownerId) continue
    heartsByPlayerId[ownerId] = (heartsByPlayerId[ownerId] || 0) + 1
  }

  const { data: raceFavoritesData, error: raceFavoritesError } = await supabase
    .from("race_response_favorites")
    .select("race_response_id")

  if (raceFavoritesError) {
    console.error("Error fetching race favorites for leaderboard stats:", raceFavoritesError)
    return NextResponse.json({ error: raceFavoritesError.message }, { status: 500 })
  }

  for (const favorite of (raceFavoritesData || []) as RaceFavoriteRow[]) {
    const ownerId = parseRaceResponsePlayerId(favorite.race_response_id)
    if (!ownerId || !trackedPlayerIds.has(ownerId)) continue
    heartsByPlayerId[ownerId] = (heartsByPlayerId[ownerId] || 0) + 1
  }

  const trackedPlayerNameById = new Map<string, string>()
  for (const player of trackedPlayers) {
    trackedPlayerNameById.set(player.id, player.name)
  }

  for (const [playerId, totalHearts] of Object.entries(heartsByPlayerId)) {
    const playerName = trackedPlayerNameById.get(playerId)
    if (!playerName) continue
    heartsByName[playerName] = (heartsByName[playerName] || 0) + totalHearts
  }

  return NextResponse.json({ stats: heartsByName })
}
