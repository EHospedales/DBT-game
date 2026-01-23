"use client"

export const dynamic = "force-dynamic"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function WaitingRoom() {
  const params = useSearchParams()
  const gameId = params.get("game")
  const playerId = params.get("player")

  const [players, setPlayers] = useState<any[]>([])
  const [phase, setPhase] = useState("lobby")

  // Subscribe to players joining
  useEffect(() => {
    if (!gameId) return

    const channel = supabase
      .channel(`players:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "players",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          setPlayers((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [gameId])

  // Subscribe to phase changes
  useEffect(() => {
    if (!gameId) return

    const channel = supabase
      .channel(`phase:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          setPhase(payload.new.phase)
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [gameId])

  // When host starts the game → redirect to play page
  useEffect(() => {
    if (phase === "prompt") {
      window.location.href = `/dbt-game/play?game=${gameId}&player=${playerId}`
    }
  }, [phase, gameId, playerId])

  return (
    <div className="min-h-screen p-10 space-y-6 text-center bg-[#FAFAF7]">
      <h1 className="text-3xl font-bold text-[#2F3E46]">
        Waiting for Host…
      </h1>

      <p className="text-[#475B5A]">
        You’re in the room. The host will begin shortly.
      </p>

      <div className="space-y-2 max-w-sm mx-auto">
        {players.map((p) => (
          <div
            key={p.id}
            className="rounded-lg bg-[#F5F5F0] px-4 py-2 border border-[#DDE2D9] shadow-sm"
          >
            <span className="text-[#2F3E46]">
              {p.name}
            </span>
          </div>
        ))}
      </div>

      <p className="text-sm text-[#475B5A] opacity-70">
        Waiting for other players to join…
      </p>
    </div>
  )
}
