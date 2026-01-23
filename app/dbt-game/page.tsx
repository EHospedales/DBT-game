"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function GameEntryPage() {
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
    <div className="p-10 max-w-md mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-[#4A3F35] dark:text-[#E8D8C4]">
        Join a DBT Game
      </h1>

      <p className="text-[#4A3F35] dark:text-[#E8D8C4]">
        Enter the game code shared by your host.
      </p>

      <input
        type="text"
        className="w-full p-3 rounded-lg border border-neutral-300 text-[#4A3F35]"
        placeholder="Game code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={submitCode}
        className="w-full bg-[#C9A27C] text-white p-3 rounded-lg shadow hover:opacity-90 transition"
      >
        Join Game
      </button>
    </div>
  )
}