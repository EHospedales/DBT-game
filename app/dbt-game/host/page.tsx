"use client"
export const dynamic = "force-dynamic"

import { QRCodeSVG } from "qrcode.react"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { PlayerList } from "../components/PlayerList"
import { RoundSummary } from "../components/RoundSummary"

const SAMPLE_PROMPTS = [
  "Your friend cancels plans last minute. What’s your first internal reaction?",
  "You receive unexpected criticism at work. What emotion comes up first?",
  "You feel overwhelmed by tasks. What skill might help you regulate?",
]

export default function HostPage() {
  const [gameId, setGameId] = useState<string | null>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [responses, setResponses] = useState<any[]>([])
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<"lobby" | "prompt" | "reveal" | "discussion">("lobby")
  const [currentPrompt, setCurrentPrompt] = useState("")

  useEffect(() => {
    async function createGame() {
      const res = await fetch("/api/game/create", { method: "POST" })
      const data = await res.json()
      setGameId(data.id)
    }
    createGame()
  }, [])

  useEffect(() => {
    if (!gameId) return

    const channel = supabase
      .channel(`players:${gameId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "players",
        filter: `game_id=eq.${gameId}`,
      }, (payload) => {
        setPlayers((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId])

  useEffect(() => {
    if (!gameId) return

    const channel = supabase
      .channel(`responses:${gameId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "responses",
        filter: `game_id=eq.${gameId}`,
      }, (payload) => {
        setResponses((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId])

  useEffect(() => {
    if (!gameId) return

    const channel = supabase
      .channel(`phase:${gameId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "games",
        filter: `id=eq.${gameId}`,
      }, (payload) => {
        setPhase(payload.new.phase)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId])

  async function sendPrompt() {
    if (!gameId) return

    const prompt = SAMPLE_PROMPTS[round % SAMPLE_PROMPTS.length]

    await fetch("/api/game/next", {
      method: "POST",
      body: JSON.stringify({ gameId, prompt }),
    })

    setCurrentPrompt(prompt)
    setResponses([])
    setRound((r) => r + 1)
    setPhase("prompt")
  }

  async function revealResponses() {
    if (!gameId) return
    await supabase.from("games").update({ phase: "reveal" }).eq("id", gameId)
    setPhase("reveal")
  }

  async function startDiscussion() {
    if (!gameId) return
    await supabase.from("games").update({ phase: "discussion" }).eq("id", gameId)
    setPhase("discussion")
  }

  if (!gameId) {
    return <p className="p-10 text-[#475B5A]">Creating game…</p>
  }

  return (
    <div className="p-10 space-y-10 bg-[#FAFAF7] min-h-screen">
      <h1 className="text-3xl font-bold text-[#2F3E46]">Host Controls</h1>

      {phase === "lobby" && (
        <>
          <div className="rounded-xl bg-[#F5F5F0] p-6 shadow-md border border-[#DDE2D9] space-y-4">
            <p className="text-lg text-[#475B5A]">Share this code with your group:</p>
            <p className="text-4xl font-bold tracking-widest text-[#2F3E46]">{gameId}</p>

            <div className="flex justify-center mt-6">
              <QRCodeSVG
                value={`http://localhost/dbt-game?game=${gameId}`}
                size={180}
                bgColor="#FAFAF7"
                fgColor="#2F3E46"
                level="H"
                includeMargin
              />
            </div>
          </div>

          <PlayerList players={players.map((p) => p.name)} />

          <button
            onClick={sendPrompt}
            className="px-6 py-3 rounded-lg bg-[#A3B18A] text-white text-lg shadow hover:bg-[#588157] transition"
          >
            Start Game
          </button>
        </>
      )}

      {phase === "prompt" && (
        <div className="space-y-6">
          <p className="text-xl text-[#475B5A]">Prompt sent. Waiting for responses…</p>
          <button
            onClick={revealResponses}
            className="px-6 py-3 rounded-lg bg-[#F5F5F0] text-[#2F3E46] text-lg shadow border border-[#DDE2D9] hover:bg-[#E8EAE4] transition"
          >
            Reveal Responses
          </button>
        </div>
      )}

      {phase === "reveal" && (
        <RoundSummary
          prompt={currentPrompt}
          responses={responses.map((r) => ({
            player: players.find((p) => p.id === r.player_id)?.name || "Unknown",
            mindState: r.mind_state,
            reflection: r.text_response,
          }))}
          onNext={startDiscussion}
        />
      )}

      {phase === "discussion" && (
        <div className="space-y-6">
          <p className="text-xl text-[#475B5A]">Group discussion in progress…</p>
          <button
            onClick={sendPrompt}
            className="px-6 py-3 rounded-lg bg-[#A3B18A] text-white text-lg shadow hover:bg-[#588157] transition"
          >
            Next Round
          </button>
        </div>
      )}
    </div>
  )
}