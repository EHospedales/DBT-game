"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function EnterGameCodePage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)

  function submitCode() {
    if (!code.trim()) {
      setError("Please enter a game code.")
      return
    }

    router.push(`/dbt-game/join?game=${code.trim()}`)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center p-10 bg-[#FAFAF7]">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#2F3E46]">
          Join a DBT Game
        </h1>

        <p className="text-[#475B5A]">
          Enter the game code shared by your host.
        </p>

        <input
          type="text"
          className="w-full p-3 rounded-lg border border-[#DDE2D9] bg-[#F5F5F0] text-[#2F3E46] placeholder-[#8A9A9A]"
          placeholder="Game code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <button
          onClick={submitCode}
          className="w-full bg-[#A3B18A] text-white p-3 rounded-lg shadow hover:bg-[#588157] transition"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
