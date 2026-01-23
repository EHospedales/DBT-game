import { getSupabaseServer } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { gameId, name } = await req.json()

  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from("players")
    .insert({ game_id: gameId, name })
    .select()
    .single()

  return NextResponse.json({ player: data })
}
