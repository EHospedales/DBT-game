"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function JoinPage() {
  const router = useRouter()
  const params = useSearchParams()

  const gameId = params.get("game")

  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function joinGame() {
    if (!name.trim() || !gameId) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/game/join", {
        method: "POST",
        body: JSON.stringify({ gameId, name }),
      })

      const { player } = await res.json()

      if (!player?.id) {
        setError("Could not join game.")
        setLoading(false)
        return
      }

      router.push(`/dbt-game/waiting?game=${gameId}&player=${player.id}`)
    } catch (err) {
      setError("Something went wrong.")
      console.error(err)
    }

    setLoading(false)
  }

  if (!gameId) {
    return (
      <div className="p-10 text-[#475B5A]">
        Invalid game code.
      </div>
    )
  }

  return (
    <div className="min-h-screen p-10 space-y-6 max-w-md mx-auto bg-[#FAFAF7]">
      <h1 className="text-3xl font-bold text-[#2F3E46]">
        Join Game
      </h1>

      <p className="text-[#475B5A]">
        Enter your name to join the game:
      </p>

      <input
        type="text"
        className="w-full p-3 rounded-lg border border-[#DDE2D9] bg-[#F5F5F0] text-[#2F3E46] placeholder-[#8A9A9A]"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        onClick={joinGame}
        disabled={loading}
        className="w-full bg-[#A3B18A] text-white p-3 rounded-lg shadow hover:bg-[#588157] transition"
      >
        {loading ? "Joining…" : "Join Game"}
      </button>
    </div>
  )
}
