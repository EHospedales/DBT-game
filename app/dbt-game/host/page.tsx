"use client"
export const dynamic = "force-dynamic"

import { QRCodeSVG } from "qrcode.react"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { PlayerList } from "../components/PlayerList"
import { RoundSummary } from "../components/RoundSummary"
import { Leaderboard } from "../components/Leaderboard"
import { OppositeActionRaceHost } from "../components/OppositeActionRaceHost"

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
  const [phase, setPhase] = useState<"lobby" | "prompt" | "reveal" | "discussion" | "opposite_action_race" | "race_reveal">("lobby")
  const [mode, setMode] = useState<"reflection" | "opposite_action_race">("reflection")
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})

  useEffect(() => {
    async function createGame() {
      try {
        const res = await fetch("/api/game/create", { method: "POST" })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: res.statusText }))
          const errorMessage = errorData?.error || `Failed to create game: ${res.status}`
          console.error("Failed to create game:", errorMessage)
          setError(errorMessage)
          return
        }
        const data = await res.json()
        if (data.id) {
          setGameId(data.id)
        } else {
          console.error("No game ID in response:", data)
          setError("No game ID returned from server")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        console.error("Error creating game:", errorMessage)
        setError(errorMessage)
      }
    }
    createGame()
  }, [])

  // Fetch existing players on mount
  useEffect(() => {
    if (!gameId) return

    async function loadPlayers() {
      try {
        const { data } = await supabase
          .from("players")
          .select("*")
          .eq("game_id", gameId)

        if (data) {
          console.log("Loaded existing players:", data)
          setPlayers(data)
        }
      } catch (err) {
        console.error("Error loading players:", err)
      }
    }

    loadPlayers()
  }, [gameId])

  useEffect(() => {
    if (!gameId) return

    const channel = supabase
      .channel(`players:${gameId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "players",
        filter: `game_id=eq.${gameId}`,
      }, (payload: any) => {
        console.log("Player joined:", payload.new)
        setPlayers((prev) => [...prev, payload.new])
      })
      .subscribe((status: any) => {
        console.log("Players subscription status:", status)
      })

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
      }, (payload: any) => {
        console.log("Response received:", payload.new)
        setResponses((prev) => [...prev, payload.new])
      })
      .subscribe((status: any) => {
        console.log("Responses subscription status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId])

  // Fetch existing responses when phase changes to "prompt"
  useEffect(() => {
    if (!gameId || phase !== "prompt") return

    async function loadResponses() {
      try {
        const { data } = await supabase
          .from("responses")
          .select("*")
          .eq("game_id", gameId)

        if (data) {
          console.log("Loaded existing responses:", data)
          setResponses(data)
        }
      } catch (err) {
        console.error("Error loading responses:", err)
      }
    }

    loadResponses()
  }, [gameId, phase])

  useEffect(() => {
    if (!gameId) return

    const channel = supabase
      .channel(`phase:${gameId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "games",
        filter: `id=eq.${gameId}`,
      }, (payload: any) => {
        console.log("Game update received:", payload.new)
        if (payload.new.phase !== undefined) {
          setPhase(payload.new.phase)
        }
        if (payload.new.mode !== undefined) {
          setMode(payload.new.mode)
        }
        if (payload.new.scores !== undefined) {
          setScores(payload.new.scores)
        }
      })
      .subscribe((status: any) => {
        console.log("Game subscription status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId])

  async function sendPrompt() {
    if (!gameId) return

    const prompt = SAMPLE_PROMPTS[round % SAMPLE_PROMPTS.length]

    try {
      const res = await fetch("/api/game/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, prompt }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: res.statusText }))
        console.error("API error:", errorData)
        return
      }

      console.log("Prompt sent successfully:", prompt)
      setCurrentPrompt(prompt)
      setResponses([])
      setRound((r) => r + 1)
      setPhase("prompt")
    } catch (err) {
      console.error("Error sending prompt:", err)
    }
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

  const handleRaceComplete = (winnerId: string, raceResponses: any[]) => {
    // Award points to winner (only if there's a winner)
    if (winnerId) {
      setScores(prev => ({
        ...prev,
        [winnerId]: (prev[winnerId] || 0) + 10
      }))
    }

    // Update game state
    supabase.from("games").update({
      race_winner: winnerId || null,
      race_responses: raceResponses,
      phase: "race_reveal"
    }).eq("id", gameId)

    setPhase("race_reveal")
  }

  const switchToOppositeActionRace = async () => {
    setMode("opposite_action_race")
    // Update database with new mode and phase
    await supabase.from("games").update({
      mode: "opposite_action_race",
      phase: "opposite_action_race"
    }).eq("id", gameId)
    setPhase("opposite_action_race")
  }

  const switchToReflection = () => {
    setMode("reflection")
    // Update database with new mode
    supabase.from("games").update({
      mode: "reflection"
    }).eq("id", gameId)
    setPhase("lobby")
  }

  if (!gameId) {
    return (
      <div className="p-10 min-h-screen bg-[#FAFAF7]">
        {error ? (
          <div className="max-w-md mx-auto space-y-4">
            <p className="text-lg font-semibold text-red-600">Error creating game</p>
            <p className="text-[#475B5A]">{error}</p>
            <button
              onClick={() => {
                setError(null)
                window.location.reload()
              }}
              className="px-6 py-3 rounded-lg bg-[#A3B18A] text-white text-lg shadow hover:bg-[#588157] transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <p className="text-[#475B5A]">Creating game…</p>
        )}
      </div>
    )
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
                value={`${typeof window !== 'undefined' ? window.location.origin : 'https://dbt-game-nmco.vercel.app'}/dbt-game/join?game=${gameId}`}
                size={180}
                bgColor="#FAFAF7"
                fgColor="#2F3E46"
                level="H"
                includeMargin
              />
            </div>
          </div>

          <PlayerList players={players.map((p) => p.name)} />

          {/* Game Mode Selection */}
          <div className="bg-[#F5F5F0] rounded-xl p-6 shadow-md border border-[#DDE2D9]">
            <h3 className="text-lg font-semibold text-[#2F3E46] mb-4">Choose Game Mode:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={switchToReflection}
                className={`p-4 rounded-lg border-2 transition ${
                  mode === "reflection"
                    ? "border-[#A3B18A] bg-[#A3B18A] text-white"
                    : "border-[#DDE2D9] bg-white text-[#2F3E46] hover:border-[#A3B18A]"
                }`}
              >
                <div className="text-xl font-semibold mb-2">📝 Reflection</div>
                <p className="text-sm">
                  Traditional DBT reflection prompts with group discussion
                </p>
              </button>

              <button
                onClick={switchToOppositeActionRace}
                className={`p-4 rounded-lg border-2 transition ${
                  mode === "opposite_action_race"
                    ? "border-[#A3B18A] bg-[#A3B18A] text-white"
                    : "border-[#DDE2D9] bg-white text-[#2F3E46] hover:border-[#A3B18A]"
                }`}
              >
                <div className="text-xl font-semibold mb-2">🏃‍♀️ Opposite Action Race</div>
                <p className="text-sm">
                  Fast-paced racing to suggest opposite actions for emotions
                </p>
              </button>
            </div>
          </div>

          {/* Leaderboard */}
          <Leaderboard scores={scores} players={players} />

          {mode === "reflection" && (
            <button
              onClick={sendPrompt}
              className="px-6 py-3 rounded-lg bg-[#A3B18A] text-white text-lg shadow hover:bg-[#588157] transition"
            >
              Start Reflection Round
            </button>
          )}

          {mode === "opposite_action_race" && (
            <OppositeActionRaceHost
              gameId={gameId}
              players={players}
              onRaceComplete={handleRaceComplete}
            />
          )}
        </>
      )}

      {phase === "prompt" && (
        <div className="space-y-6">
          <div>
            <p className="text-xl text-[#475B5A]">Prompt sent. Waiting for responses…</p>
            <p className="text-lg font-semibold text-[#2F3E46] mt-2">
              {responses.length} / {players.length} responses received
            </p>
          </div>

          {responses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#4A3F35]">Incoming Responses:</h3>
              <div className="space-y-3">
                {responses.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-[#E8D8C4] p-4 shadow-md border-l-4 border-[#A3B18A]"
                  >
                    <p className="font-semibold text-[#4A3F35]">
                      {players.find((p) => p.id === r.player_id)?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-[#4A3F35] opacity-75 mt-1">
                      Mind State: <strong>{r.mind_state}</strong>
                    </p>
                    <p className="mt-2 text-[#4A3F35] text-sm">{r.text_response}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={revealResponses}
            className="px-6 py-3 rounded-lg bg-[#F5F5F0] text-[#2F3E46] text-lg shadow border border-[#DDE2D9] hover:bg-[#E8EAE4] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={responses.length === 0}
          >
            Reveal Responses
          </button>
        </div>
      )}

      {phase === "reveal" && (
        <RoundSummary
          prompt={currentPrompt}
          responses={responses.map((r) => ({
            id: r.id,
            player: players.find((p) => p.id === r.player_id)?.name || "Unknown",
            mindState: r.mind_state,
            reflection: r.text_response,
          }))}
          gameId={gameId || undefined}
          isHost={true}
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

      {phase === "opposite_action_race" && (
        <div className="space-y-6">
          <OppositeActionRaceHost
            gameId={gameId}
            players={players}
            onRaceComplete={handleRaceComplete}
          />
        </div>
      )}

      {phase === "race_reveal" && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-[#2F3E46] mb-2">
              Race Complete!
            </h2>
            <p className="text-lg text-[#475B5A]">
              Points have been awarded. Ready for the next round?
            </p>
          </div>

          <Leaderboard scores={scores} players={players} />

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setPhase("lobby")}
              className="px-6 py-3 rounded-lg bg-[#A3B18A] text-white text-lg shadow hover:bg-[#588157] transition"
            >
              Back to Lobby
            </button>
            <button
              onClick={() => setPhase("opposite_action_race")}
              className="px-6 py-3 rounded-lg bg-[#F5F5F0] text-[#2F3E46] text-lg shadow border border-[#DDE2D9] hover:bg-[#E8EAE4] transition"
            >
              Start Another Race
            </button>
          </div>
        </div>
      )}
    </div>
  )
}