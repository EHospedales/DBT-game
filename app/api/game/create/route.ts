import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function POST() {
  const { data, error } = await supabaseServer
    .from("games")
    .insert({
      phase: "lobby",
      prompt: null,
      current_round: 0,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating game:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}
