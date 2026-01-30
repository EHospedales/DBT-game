"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function WaitingContent() {
  const params = useSearchParams()
  const gameId = params.get("game")
  const playerId = params.get("player")

  const [players, setPlayers] = useState<any[]>([])
  const [phase, setPhase] = useState("lobby")
  const [mode, setMode] = useState("reflection")

  // Fetch existing players on mount
  useEffect(() => {
    if (!gameId) return

    async function loadPlayers() {
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("game_id", gameId)

      if (data) {
        setPlayers(data)
      }
    }

    loadPlayers()
  }, [gameId])

  // Fetch initial game phase and mode
  useEffect(() => {
    if (!gameId) return

    async function loadGameState() {
      const { data } = await supabase
        .from("games")
        .select("phase, mode")
        .eq("id", gameId)
        .single()

      if (data?.phase) {
        setPhase(data.phase)
      }

      if (data?.mode) {
        setMode(data.mode)
      }
    }

    loadGameState()
  }, [gameId])

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
        (payload: any) => {
          setPlayers((prev) => [...prev, payload.new])
        }
      )
      .subscribe((status: any) => {
        console.log("Players subscription status:", status)
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [gameId])

  // Subscribe to phase and mode changes
  useEffect(() => {
    if (!gameId) return

    const channel = supabase
      .channel(`games:phase:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        (payload: any) => {
          console.log("Game update received:", payload.new)
          if (payload.new.phase !== undefined) {
            setPhase(payload.new.phase)
          }
          if (payload.new.mode !== undefined) {
            setMode(payload.new.mode)
          }
        }
      )
      .subscribe((status: any) => {
        console.log("Game subscription status:", status)
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [gameId])

  // When host starts the game → redirect to play page
  useEffect(() => {
    console.log("Phase updated to:", phase)
    if (phase === "prompt" || phase === "opposite_action_race") {
      console.log("Redirecting to play page...")
      window.location.href = `/dbt-game/play?game=${gameId}&player=${playerId}`
    }
  }, [phase, gameId, playerId])

  // Poll for phase changes as a fallback
  useEffect(() => {
    if (!gameId || phase === "prompt" || phase === "opposite_action_race") return

    const pollInterval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from("games")
          .select("phase")
          .eq("id", gameId)
          .single()

        if (data?.phase === "prompt" || data?.phase === "opposite_action_race") {
          console.log("Poll detected phase change to prompt or race")
          setPhase(data.phase)
        }
      } catch (err) {
        console.error("Error polling for phase:", err)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [gameId, phase])

  return (
    <div className="min-h-screen p-10 space-y-6 text-center bg-[#FAFAF7]">
      <h1 className="text-3xl font-bold text-[#2F3E46]">
        Waiting for Host…
      </h1>

      <p className="text-[#475B5A]">
        You're in the room. The host will begin shortly.
      </p>

      {/* Game Mode Indicator */}
      {mode === "opposite_action_race" && (
        <div className="text-center p-4 bg-[#A3B18A] text-white rounded-xl max-w-md mx-auto">
          <div className="text-2xl mb-1">🏃‍♀️</div>
          <h2 className="text-lg font-bold">Opposite Action Race Mode</h2>
          <p className="text-sm opacity-90">
            Get ready for fast-paced emotion challenges!
          </p>
        </div>
      )}

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
