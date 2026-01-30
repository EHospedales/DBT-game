"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { oppositeActionPrompts, OppositeActionPrompt } from "../lib/oppositeActionPrompts"
import { Timer } from "./Timer"

interface OppositeActionRaceHostProps {
  gameId: string
  players: Array<{ id: string; name: string }>
  onRaceComplete: (winnerId: string, responses: any[]) => void
}

export function OppositeActionRaceHost({
  gameId,
  players,
  onRaceComplete
}: OppositeActionRaceHostProps) {
  const [currentPrompt, setCurrentPrompt] = useState<OppositeActionPrompt | null>(null)
  const [raceActive, setRaceActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [responses, setResponses] = useState<Array<{
    playerId: string
    playerName: string
    action: string
    timestamp: number
  }>>([])
  const [winner, setWinner] = useState<string | null>(null)

  // Start a new race
  const startRace = () => {
    const randomPrompt = oppositeActionPrompts[Math.floor(Math.random() * oppositeActionPrompts.length)]
    console.log("Starting race with prompt:", randomPrompt)
    setCurrentPrompt(randomPrompt)
    setRaceActive(true)
    setTimeLeft(30)
    setResponses([])
    setWinner(null)

    // Update game state with race prompt
    supabase.from("games").update({
      race_prompt: {
        emotion: randomPrompt.emotion,
        scenario: randomPrompt.scenario,
        urge: randomPrompt.urge
      },
      phase: "opposite_action_race"
    }).eq("id", gameId).then((result: any) => {
      console.log("Race start database update result:", result)
    })
  }

  // Listen for race responses
  useEffect(() => {
    if (!gameId || !raceActive) return

    const channel = supabase
      .channel(`race_responses:${gameId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "race_responses",
        filter: `game_id=eq.${gameId}`,
      }, (payload: any) => {
        const newResponse = {
          playerId: payload.new.player_id,
          playerName: players.find(p => p.id === payload.new.player_id)?.name || "Unknown",
          action: payload.new.action,
          timestamp: payload.new.timestamp
        }
        setResponses(prev => [...prev, newResponse])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId, raceActive, players])

  // Handle race completion
  const endRace = () => {
    setRaceActive(false)

    if (responses.length > 0) {
      // Find the fastest correct response
      const correctActions = currentPrompt?.correctActions || []
      const correctResponse = responses.find(r =>
        correctActions.some(correct =>
          r.action.toLowerCase().includes(correct.toLowerCase()) ||
          correct.toLowerCase().includes(r.action.toLowerCase())
        )
      )

      if (correctResponse) {
        setWinner(correctResponse.playerId)
        onRaceComplete(correctResponse.playerId, responses)
      } else {
        // No correct answers - first responder wins
        const firstResponse = responses.sort((a, b) => a.timestamp - b.timestamp)[0]
        setWinner(firstResponse.playerId)
        onRaceComplete(firstResponse.playerId, responses)
      }
    } else {
      // No responses - no winner
      setWinner(null)
      onRaceComplete("", responses) // Empty string for no winner
    }
  }

  // Auto-end race when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0 && raceActive) {
      endRace()
    }
  }, [timeLeft, raceActive])

  // Countdown timer
  useEffect(() => {
    if (!raceActive || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [raceActive, timeLeft])

  return (
    <div className="space-y-6">
      {!raceActive && !winner && (
        <div className="text-center">
          <button
            onClick={startRace}
            className="px-8 py-4 bg-[#A3B18A] hover:bg-[#588157] text-white text-xl font-semibold rounded-xl shadow-lg transition"
          >
            🏁 Start Opposite Action Race!
          </button>
          <p className="text-[#475B5A] mt-2">
            Players will race to suggest opposite actions for emotions
          </p>
        </div>
      )}

      {currentPrompt && raceActive && (
        <div className="bg-[#F5F5F0] rounded-xl p-6 border border-[#DDE2D9] shadow-md">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-[#2F3E46] mb-2">
              🏃‍♀️ Race Active!
            </h2>
            <div className="text-4xl font-bold text-[#2F3E46] mb-2">
              {timeLeft}s
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-[#DDE2D9] mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">
                {currentPrompt.emotion === "Anger" ? "😠" :
                 currentPrompt.emotion === "Sadness" ? "😢" :
                 currentPrompt.emotion === "Anxiety" ? "😰" :
                 currentPrompt.emotion === "Shame" ? "😳" :
                 currentPrompt.emotion === "Jealousy" ? "😒" :
                 currentPrompt.emotion === "Fear" ? "😨" :
                 currentPrompt.emotion === "Guilt" ? "😔" :
                 currentPrompt.emotion === "Loneliness" ? "😞" : "😐"}
              </span>
              <span className="text-xl font-semibold text-[#2F3E46]">
                {currentPrompt.emotion}
              </span>
            </div>
            <p className="text-[#475B5A] mb-3">
              <strong>Scenario:</strong> {currentPrompt.scenario}
            </p>
            <p className="text-[#475B5A]">
              <strong>Typical urge:</strong> {currentPrompt.urge}
            </p>
          </div>

          <div className="text-center">
            <p className="text-lg text-[#475B5A] mb-2">
              Responses received: {responses.length} / {players.length}
            </p>
            <button
              onClick={endRace}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
            >
              End Race Early
            </button>
          </div>
        </div>
      )}

      {winner && (
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Race Complete!
            </h3>
            <p className="text-lg text-green-700 mb-4">
              Winner: <strong>{players.find(p => p.id === winner)?.name}</strong>
            </p>

            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="font-semibold text-green-800">All Responses:</h4>
              {responses.map((response, index) => (
                <div key={index} className="bg-white p-3 rounded border text-left">
                  <strong>{response.playerName}:</strong> {response.action}
                  {response.playerId === winner && (
                    <span className="ml-2 text-yellow-600">⭐ Winner!</span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setWinner(null)
                setCurrentPrompt(null)
                setResponses([])
              }}
              className="mt-6 px-6 py-3 bg-[#A3B18A] hover:bg-[#588157] text-white font-semibold rounded-lg transition"
            >
              Start Next Race
            </button>
          </div>
        </div>
      )}
    </div>
  )
}