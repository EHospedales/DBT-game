"use client"

import { useEffect, useMemo, useState } from "react"

interface LeaderboardProps {
  scores: Record<string, number>
  players: Array<{ id: string; name: string }>
  currentPlayerId?: string
}

export function Leaderboard({ scores, players, currentPlayerId }: LeaderboardProps) {
  const [allTimeHearts, setAllTimeHearts] = useState<Record<string, number>>({})

  const playerNames = useMemo(() => {
    return Array.from(new Set(players.map((player) => player.name).filter(Boolean)))
  }, [players])

  useEffect(() => {
    if (playerNames.length === 0) {
      return
    }

    let isActive = true

    async function loadAllTimeHearts() {
      try {
        const params = new URLSearchParams({
          playerNames: playerNames.join(","),
        })

        const res = await fetch(`/api/game/leaderboard-stats?${params.toString()}`)
        if (!res.ok) return

        const data = await res.json()
        if (isActive) {
          setAllTimeHearts(data.stats || {})
        }
      } catch (error) {
        console.error("Error loading leaderboard hearts:", error)
      }
    }

    loadAllTimeHearts()

    return () => {
      isActive = false
    }
  }, [playerNames])

  // Create sorted leaderboard
  const leaderboard = players
    .map(player => ({
      id: player.id,
      name: player.name,
      score: scores[player.id] || 0,
      hearts: allTimeHearts[player.name] || 0,
    }))
    .sort((a, b) => b.score - a.score)

  return (
    <div className="bg-[#F5F5F0] rounded-xl p-6 border border-[#DDE2D9] shadow-md">
      <h3 className="text-xl font-semibold text-[#2F3E46] mb-4 text-center">
        🏆 Leaderboard
      </h3>

      <div className="space-y-2">
        {leaderboard.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              player.id === currentPlayerId
                ? "bg-[#A3B18A] text-white"
                : "bg-white border border-[#DDE2D9]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? "bg-yellow-400 text-yellow-900" :
                index === 1 ? "bg-gray-300 text-gray-800" :
                index === 2 ? "bg-amber-600 text-amber-100" :
                "bg-[#E8D8C4] text-[#2F3E46]"
              }`}>
                {index + 1}
              </div>
              <span className={`font-medium ${
                player.id === currentPlayerId ? "text-white" : "text-[#2F3E46]"
              }`}>
                {player.name}
              </span>
            </div>

            <div className={`text-right ${
              player.id === currentPlayerId ? "text-white" : "text-[#2F3E46]"
            }`}>
              <div className="text-lg font-bold">{player.score} pts</div>
              <div className="text-xs font-semibold opacity-90">❤️ {player.hearts} all-time</div>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <p className="text-center text-[#475B5A] py-4">
          No scores yet - start playing to earn points!
        </p>
      )}
    </div>
  )
}