"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "../lib/supabase"
import { PromptCard } from "../components/PromptCard"
import { SkillCard } from "../components/SkillCard"
import { Timer } from "../components/Timer"
import { BreathingTransition } from "../components/BreathingTransition"
import { RoundSummary } from "../components/RoundSummary"
import { RaceRoundSummary } from "../components/RaceRoundSummary"
import { OppositeActionRace } from "../components/OppositeActionRace"
import { Leaderboard } from "../components/Leaderboard"

export default function PlayContent() {
  const params = useSearchParams()
  const gameId = params.get("game")
  const playerId = params.get("player")

  const [prompt, setPrompt] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [reflection, setReflection] = useState("")
  const [showInput, setShowInput] = useState(false)
  const [phase, setPhase] = useState<"prompt" | "reveal" | "discussion" | "opposite_action_race" | "race_reveal">("prompt")
  const [mode, setMode] = useState<"reflection" | "opposite_action_race">("reflection")
  const [showBreathing, setShowBreathing] = useState(false)
  const [responses, setResponses] = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [racePrompt, setRacePrompt] = useState<{
    emotion: string
    scenario: string
    urge: string
  } | null>(null)
  const [raceWinner, setRaceWinner] = useState<string | null>(null)
  const [raceResponses, setRaceResponses] = useState<Array<{
    playerId: string
    playerName: string
    action: string
    timestamp: number
  }>>([])
  const [raceTimeLeft, setRaceTimeLeft] = useState<number | null>(null)
  const [currentRound, setCurrentRound] = useState<number>(0)

  const handleBreathingComplete = useCallback(() => {
    setShowBreathing(false)
  }, [])

  async function submitResponse() {
    if (!selected || !reflection.trim()) return

    await fetch("/api/game/respond", {
      method: "POST",
      body: JSON.stringify({
        gameId,
        playerId,
        mindState: selected,
        reflection,
      }),
    })

    setShowInput(false)
    setReflection("")
  }

  async function submitRaceResponse(action: string) {
    console.log("Submitting race response:", action)
    try {
      const response = await fetch("/api/game/race-response", {
        method: "POST",
        body: JSON.stringify({
          gameId,
          playerId,
          action,
        }),
      })
      console.log("Race response API result:", response.status, response.ok)
      if (!response.ok) {
        console.error("Failed to submit race response")
      }
    } catch (error) {
      console.error("Error submitting race response:", error)
    }
  }

  // ⭐ NEW: Fetch current prompt on load (fixes missing first prompt)
  useEffect(() => {
    async function loadPrompt() {
      if (!gameId) return

      try {
        const { data } = await supabase
          .from("games")
          .select("prompt, phase, mode, scores, race_prompt, race_winner, race_responses, race_time_left, current_round")
          .eq("id", gameId)
          .single()

        if (data?.prompt) {
          console.log("Loaded prompt:", data.prompt)
          setPrompt(data.prompt)
        }

        if (data?.phase) {
          console.log("Loaded phase:", data.phase)
          setPhase(data.phase)
        }

        if (data?.mode) {
          setMode(data.mode)
        }

        if (data?.scores) {
          setScores(data.scores)
        }

        if (data?.race_prompt) {
          console.log("Loaded race_prompt:", data.race_prompt)
          setRacePrompt(data.race_prompt)
        }

        if (data?.race_winner) {
          setRaceWinner(data.race_winner)
        }

        if (data?.race_responses) {
          console.log("Loaded race_responses:", data.race_responses)
          setRaceResponses(data.race_responses)
        }

        if (data?.race_time_left !== undefined) {
          setRaceTimeLeft(data.race_time_left)
        }

        if (data?.current_round !== undefined) {
          setCurrentRound(data.current_round)
        }
      } catch (err) {
        console.error("Error loading game state:", err)
      }
    }

    loadPrompt()
  }, [gameId])

  // Fetch players
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

  // Subscribe to player changes
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
        setPlayers((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId])

  // Fetch responses for reveal phase
  useEffect(() => {
    if (!gameId || phase !== "reveal") return

    async function loadResponses() {
      const { data } = await supabase
        .from("responses")
        .select("*")
        .eq("game_id", gameId)
        .eq("round", currentRound)

      if (data) {
        setResponses(data)
      }
    }

    loadResponses()
  }, [gameId, phase, currentRound])

  // Subscribe to response changes during reveal
  useEffect(() => {
    if (!gameId || phase !== "reveal") return

    const channel = supabase
      .channel(`responses:${gameId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "responses",
        filter: `game_id=eq.${gameId}`,
      }, (payload: any) => {
        // Only add responses from the current round
        if (payload.new.round === currentRound) {
          setResponses((prev) => [...prev, payload.new])
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId, phase, currentRound])

  // Combined subscription for game state updates (prompt and phase)
  useEffect(() => {
    if (!gameId) return

    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        (payload: any) => {
          console.log("Game state update received:", payload.new)
          
          // Handle prompt updates
          if (payload.new.prompt !== undefined && payload.new.prompt !== prompt) {
            console.log("New prompt received, showing breathing transition")
            setShowBreathing(true)
            setPrompt(payload.new.prompt)
            setSelected(null)
            setShowInput(false)
            setReflection("")
            setResponses([])
            // Update current round when prompt changes
            if (payload.new.current_round !== undefined) {
              setCurrentRound(payload.new.current_round)
            }
          }

          // Handle current_round updates (separate updates)
          if (payload.new.current_round !== undefined && payload.new.prompt === undefined) {
            console.log("Received current_round update:", payload.new.current_round)
            setCurrentRound(payload.new.current_round)
            // Clear responses when round changes
            setResponses([])
          }
          
          // Handle phase updates
          if (payload.new.phase !== undefined) {
            console.log("Received phase update:", payload.new.phase)
            setPhase(payload.new.phase)
          }

          // Handle mode updates
          if (payload.new.mode !== undefined) {
            setMode(payload.new.mode)
          }

          // Handle scores updates
          if (payload.new.scores !== undefined) {
            setScores(payload.new.scores)
          }

          // Handle race prompt updates
          if (payload.new.race_prompt !== undefined) {
            console.log("Received race_prompt update:", payload.new.race_prompt)
            console.log("Setting racePrompt to:", payload.new.race_prompt)
            setRacePrompt(payload.new.race_prompt)
          }

          // Handle race winner updates
          if (payload.new.race_winner !== undefined) {
            setRaceWinner(payload.new.race_winner)
          }

          // Handle race responses updates
          if (payload.new.race_responses !== undefined) {
            console.log("Received race_responses update:", payload.new.race_responses)
            console.log("Race responses length:", payload.new.race_responses?.length || 0)
            setRaceResponses(payload.new.race_responses || [])
            console.log("Set raceResponses to:", payload.new.race_responses || [])
          }

          // Handle race time left updates
          if (payload.new.race_time_left !== undefined) {
            setRaceTimeLeft(payload.new.race_time_left)
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

  if (!prompt && mode !== "opposite_action_race") {
    return (
      <div className="p-10 text-[#475B5A]">
        Waiting for host…
      </div>
    )
  }

  return (
    <div className="p-10 space-y-8 bg-[#FAFAF7] min-h-screen">
      {showBreathing && (
        <BreathingTransition onComplete={handleBreathingComplete} />
      )}

      {/* Game Mode Indicator */}
      {mode === "opposite_action_race" && (
        <div className="text-center p-6 bg-[#A3B18A] text-white rounded-xl">
          <div className="text-3xl mb-2">🏃‍♀️</div>
          <h2 className="text-xl font-bold">Opposite Action Race Mode</h2>
          <p className="text-sm opacity-90">
            {phase === "opposite_action_race" && racePrompt
              ? "Race in progress!" 
              : "Get ready for fast-paced emotion challenges!"
            }
          </p>
        </div>
      )}

      {prompt && (
        <div className="fade-in">
          <PromptCard prompt={prompt} />
        </div>
      )}

      {/* PROMPT PHASE */}
      {phase === "prompt" && (
        <div className="space-y-6 slide-up">
          <Timer seconds={30} />

          {/* Mind State Choices */}
          {!showInput && (
            <div className="grid grid-cols-1 gap-4">
              {["Emotion Mind", "Reasonable Mind", "Wise Mind"].map((choice) => (
                <SkillCard
                  key={choice}
                  title={choice}
                  selected={selected === choice}
                  onClick={() => {
                    setSelected(choice)
                    setShowInput(true)
                  }}
                  className="transition-transform duration-200 hover:scale-[1.02]"
                />
              ))}
            </div>
          )}

          {/* Reflection Input */}
          {showInput && (
            <div className="space-y-4 fade-in">
              <textarea
                className="w-full p-4 rounded-xl border border-[#DDE2D9] bg-[#F5F5F0] text-[#2F3E46]"
                placeholder={`What came up for you in ${selected}?`}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
              />

              <button
                onClick={submitResponse}
                className="w-full bg-[#A3B18A] hover:bg-[#588157] text-white p-3 rounded-xl shadow-sm transition"
              >
                Submit Reflection
              </button>
            </div>
          )}
        </div>
      )}

      {/* REVEAL PHASE */}
      {phase === "reveal" && (
        <div className="fade-in">
          {responses.length > 0 && prompt ? (
            <RoundSummary
              prompt={prompt}
              responses={responses.map((r) => ({
                id: r.id,
                player: players.find((p) => p.id === r.player_id)?.name || "Unknown",
                mindState: r.mind_state,
                reflection: r.text_response,
              }))}
              gameId={gameId || undefined}
              playerId={playerId || undefined}
              onNext={() => {}} // Players can't control phase progression
            />
          ) : (
            <div className="text-center text-xl text-[#475B5A]">
              Waiting for responses…
            </div>
          )}
        </div>
      )}

      {/* DISCUSSION PHASE */}
      {phase === "discussion" && (
        <div className="space-y-4 fade-in">
          <p className="text-center text-xl text-[#475B5A]">
            Group discussion in progress…
          </p>

          <div className="rounded-xl bg-[#F5F5F0] border border-[#DDE2D9] p-6 shadow-md slide-up">
            <p className="text-[#2F3E46] leading-relaxed">
              Take a moment to reflect on your response.  
              What emotion came up first?  
              What skill might help you regulate or respond effectively?
            </p>
          </div>
        </div>
      )}

      {/* OPPOSITE ACTION RACE PHASE */}
      {phase === "opposite_action_race" && racePrompt && (
        <div className="fade-in">
          <OppositeActionRace
            gameId={gameId || ""}
            playerId={playerId || ""}
            racePrompt={racePrompt}
            onSubmit={submitRaceResponse}
            timeLeft={raceTimeLeft || 90}
          />
        </div>
      )}

      {/* RACE REVEAL PHASE */}
      {phase === "race_reveal" && racePrompt && (
        <div className="fade-in">
          <RaceRoundSummary
            racePrompt={racePrompt}
            responses={raceResponses}
            winnerId={raceWinner}
            gameId={gameId || undefined}
            playerId={playerId || undefined}
          />

          <div className="mt-8">
            <Leaderboard scores={scores} players={players} currentPlayerId={playerId || undefined} />
          </div>

          <div className="text-center text-[#475B5A] mt-6">
            Waiting for host to start next round...
          </div>
        </div>
      )}
    </div>
  )
}
