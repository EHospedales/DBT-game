"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Timer } from "./Timer"

interface OppositeActionRaceProps {
  gameId: string
  playerId: string
  racePrompt: {
    emotion: string
    scenario: string
    urge: string
  }
  onSubmit: (action: string) => void
  timeLeft?: number
  disabled?: boolean
}

export function OppositeActionRace({
  gameId,
  playerId,
  racePrompt,
  onSubmit,
  timeLeft = 30,
  disabled = false
}: OppositeActionRaceProps) {
  const [action, setAction] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!action.trim() || submitted || disabled) return

    onSubmit(action.trim())
    setSubmitted(true)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-6">
      {/* Race Prompt Card */}
      <div className="bg-[#F5F5F0] rounded-xl p-6 border border-[#DDE2D9] shadow-md">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-[#2F3E46] mb-2">
            🏃‍♀️ Opposite Action Race!
          </h2>
          <p className="text-[#475B5A]">
            Race to suggest the best opposite action for this emotion
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-[#DDE2D9]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">
                {racePrompt.emotion === "Anger" ? "😠" :
                 racePrompt.emotion === "Sadness" ? "😢" :
                 racePrompt.emotion === "Anxiety" ? "😰" :
                 racePrompt.emotion === "Shame" ? "😳" :
                 racePrompt.emotion === "Jealousy" ? "😒" :
                 racePrompt.emotion === "Fear" ? "😨" :
                 racePrompt.emotion === "Guilt" ? "😔" :
                 racePrompt.emotion === "Loneliness" ? "😞" : "😐"}
              </span>
              <span className="text-xl font-semibold text-[#2F3E46]">
                {racePrompt.emotion}
              </span>
            </div>
            <p className="text-[#475B5A] mb-3">
              <strong>Scenario:</strong> {racePrompt.scenario}
            </p>
            <p className="text-[#475B5A]">
              <strong>Typical urge:</strong> {racePrompt.urge}
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-[#2F3E46] mb-2">
              {timeLeft}s
            </div>
            <p className="text-sm text-[#475B5A]">Time remaining</p>
          </div>
        </div>
      </div>

      {/* Action Input */}
      {!submitted && !disabled && (
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-[#2F3E46] mb-2">
              What opposite action would you take?
            </label>
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your opposite action here..."
              className="w-full p-4 rounded-xl border border-[#DDE2D9] bg-white text-[#2F3E46] resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-sm text-[#475B5A] mt-1">
              {action.length}/200 characters
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!action.trim()}
            className="w-full bg-[#A3B18A] hover:bg-[#588157] disabled:bg-gray-300 text-white p-4 rounded-xl shadow-sm transition font-semibold text-lg"
          >
            🚀 Submit Action!
          </button>
        </div>
      )}

      {submitted && (
        <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-lg font-semibold text-green-800">
            Action submitted! Waiting for results...
          </p>
        </div>
      )}

      {disabled && !submitted && (
        <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-4xl mb-2">⏱️</div>
          <p className="text-lg font-semibold text-gray-600">
            Race in progress... Get ready for the next round!
          </p>
        </div>
      )}
    </div>
  )
}