"use client"

import { useState, useEffect } from "react"

export function RaceRoundSummary({
  racePrompt,
  responses,
  winnerId,
  gameId,
  playerId,
  isHost = false,
}: {
  racePrompt: {
    emotion: string
    scenario: string
    urge: string
  }
  responses: {
    playerId: string
    playerName: string
    action: string
    timestamp: number
  }[]
  winnerId?: string | null
  gameId?: string
  playerId?: string
  isHost?: boolean
}) {
  console.log("RaceRoundSummary rendered with responses:", responses)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [favoritesCounts, setFavoritesCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  // Fetch favorite counts on mount
  useEffect(() => {
    if (!gameId) return

    async function loadFavorites() {
      try {
        console.log("Loading favorites for gameId:", gameId)
        const res = await fetch(`/api/game/race-favorite?gameId=${gameId}`)
        const data = await res.json()
        console.log("Favorites data received:", data)

        if (data.favorites) {
          // Build counts map
          const counts: Record<string, number> = {}
          const playerFavorites = new Set<string>()

          // Count favorites per response
          for (const fav of data.favorites) {
            counts[fav.race_response_id] = (counts[fav.race_response_id] || 0) + 1
            if (fav.player_id === playerId) {
              playerFavorites.add(fav.race_response_id)
            }
          }

          console.log("Setting favorites counts:", counts)
          console.log("Setting player favorites:", playerFavorites)
          setFavoritesCounts(counts)
          setFavorites(playerFavorites)
        }
      } catch (error) {
        console.error("Error loading race favorites:", error)
      }
    }

    loadFavorites()
  }, [gameId, playerId])

  async function toggleFavorite(raceResponseId: string) {
    if (!gameId || !playerId || isHost) return

    setLoading(true)
    const isFavoriting = !favorites.has(raceResponseId)

    try {
      await fetch("/api/game/race-favorite", {
        method: "POST",
        body: JSON.stringify({
          gameId,
          playerId,
          raceResponseId,
          isFavoriting,
        }),
      })

      // Update local state
      const newFavorites = new Set(favorites)
      if (isFavoriting) {
        newFavorites.add(raceResponseId)
      } else {
        newFavorites.delete(raceResponseId)
      }
      setFavorites(newFavorites)

      // Update counts
      const newCounts = { ...favoritesCounts }
      newCounts[raceResponseId] = (newCounts[raceResponseId] || 0) + (isFavoriting ? 1 : -1)
      setFavoritesCounts(newCounts)
    } catch (error) {
      console.error("Error toggling race favorite:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-[#2F3E46] mb-2">
          Race Complete!
        </h2>
        {winnerId && (
          <p className="text-lg text-[#475B5A]">
            Winner: <strong>{responses.find(r => r.playerId === winnerId)?.playerName}</strong>
          </p>
        )}
      </div>

      {/* Race Prompt Summary */}
      <div className="bg-[#F5F5F0] rounded-xl p-6 border border-[#DDE2D9] shadow-md">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-[#2F3E46]">
            Race Prompt
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 justify-center">
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
          <p className="text-[#475B5A] text-center">
            <strong>Scenario:</strong> {racePrompt.scenario}
          </p>
          <p className="text-[#475B5A] text-center">
            <strong>Typical urge:</strong> {racePrompt.urge}
          </p>
        </div>
      </div>

      {/* All Responses */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[#2F3E46] text-center">
          All Opposite Actions
        </h3>

        {responses.map((response, index) => {
          const raceResponseId = `race-${response.playerId}-${response.timestamp}`
          const isFavorited = favorites.has(raceResponseId)
          const favoriteCount = favoritesCounts[raceResponseId] || 0
          const isWinner = response.playerId === winnerId

          return (
            <div
              key={index}
              className={`rounded-xl p-6 shadow-md border ${
                isWinner
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-[#E8D8C4] border-[#DDE2D9]"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-lg font-semibold text-[#4A3F35]">
                      {response.playerName}
                    </p>
                    {isWinner && (
                      <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-sm font-semibold rounded-full">
                        🏆 Winner!
                      </span>
                    )}
                  </div>

                  <p className="text-[#4A3F35] leading-relaxed text-lg">
                    {response.action}
                  </p>
                </div>

                {!isHost && gameId && playerId && (
                  <button
                    onClick={() => toggleFavorite(raceResponseId)}
                    disabled={loading}
                    className="ml-4 flex flex-col items-center gap-1 p-2 rounded-lg transition hover:bg-[#D4B5A0] disabled:opacity-50"
                    title={isFavorited ? "Remove favorite" : "Add to favorites"}
                  >
                    <span className="text-2xl">
                      {isFavorited ? "❤️" : "🤍"}
                    </span>
                    {favoriteCount > 0 && (
                      <span className="text-xs font-semibold text-[#4A3F35]">
                        {favoriteCount}
                      </span>
                    )}
                  </button>
                )}

                {isHost && favoriteCount > 0 && (
                  <div className="ml-4 flex items-center gap-2 p-2 rounded-lg bg-[#D4B5A0]">
                    <span className="text-xl">❤️</span>
                    <span className="text-sm font-semibold text-[#4A3F35]">
                      {favoriteCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}