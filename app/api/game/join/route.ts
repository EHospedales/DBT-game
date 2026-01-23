import { supabase } from "@/app/dbt-game/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { gameId, name } = await req.json()

  const { data, error } = await supabase
    .from("players")
    .insert({ game_id: gameId, name })
    .select()
    .single()

  return NextResponse.json({ player: data })
}
