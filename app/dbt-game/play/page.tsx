"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "../lib/supabase"
import { PromptCard } from "../components/PromptCard"
import { SkillCard } from "../components/SkillCard"
import { Timer } from "../components/Timer"
import { BreathingTransition } from "../components/BreathingTransition"

export default function PlayPage() {
  const params = useSearchParams()
  const gameId = params.get("game")
  const playerId = params.get("player")

  const [prompt, setPrompt] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [reflection, setReflection] = useState("")
  const [showInput, setShowInput] = useState(false)
  const [phase, setPhase] = useState<"prompt" | "reveal" | "discussion">("prompt")
  const [showBreathing, setShowBreathing] = useState(false)

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

  // ⭐ NEW: Fetch current prompt on load (fixes missing first prompt)
  useEffect(() => {
    async function loadPrompt() {
      if (!gameId) return

      const { data } = await supabase
        .from("games")
        .select("prompt, phase")
        .eq("id", gameId)
        .single()

      if (data?.prompt) {
        setPrompt(data.prompt)
      }

      if (data?.phase) {
        setPhase(data.phase)
      }
    }

    loadPrompt()
  }, [gameId])

  // Prompt subscription (future prompts)
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
        (payload) => {
          setShowBreathing(true)
          setPrompt(payload.new.prompt)
          setSelected(null)
          setShowInput(false)
          setReflection("")
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [gameId])

  // Phase subscription
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

  if (!prompt) {
    return (
      <div className="p-10 text-[#475B5A]">
        Waiting for host…
      </div>
    )
  }

  return (
    <div className="p-10 space-y-8 bg-[#FAFAF7] min-h-screen">
      {showBreathing && (
        <BreathingTransition onComplete={() => setShowBreathing(false)} />
      )}

      <div className="fade-in">
        <PromptCard prompt={prompt} />
      </div>

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
        <div className="text-center text-xl text-[#475B5A] fade-in">
          The host is revealing responses…
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
    </div>
  )
}