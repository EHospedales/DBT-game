"use client"

import { useState, useEffect } from "react"

export function RoundSummary({
  prompt,
  responses,
  onNext,
  gameId,
  playerId,
  isHost = false,
}: {
  prompt: string
  responses: {
    id?: string
    player: string
    mindState: string
    reflection: string
    favoriteCount?: number
  }[]
  onNext: () => void
  gameId?: string
  playerId?: string
  isHost?: boolean
}) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [favoritesCounts, setFavoritesCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  // Fetch favorite counts on mount
  useEffect(() => {
    if (!gameId) return

    async function loadFavorites() {
      try {
        const res = await fetch(`/api/game/favorite?gameId=${gameId}`)
        const data = await res.json()

        if (data.favorites) {
          // Build counts map
          const counts: Record<string, number> = {}
          const playerFavorites = new Set<string>()

          // Count favorites per response
          for (const fav of data.favorites) {
            counts[fav.response_id] = (counts[fav.response_id] || 0) + 1
            if (fav.player_id === playerId) {
              playerFavorites.add(fav.response_id)
            }
          }

          setFavoritesCounts(counts)
          setFavorites(playerFavorites)
        }
      } catch (error) {
        console.error("Error loading favorites:", error)
      }
    }

    loadFavorites()
  }, [gameId, playerId])

  async function toggleFavorite(responseId: string) {
    if (!gameId || !playerId || isHost) return

    setLoading(true)
    const isFavoriting = !favorites.has(responseId)

    try {
      await fetch("/api/game/favorite", {
        method: "POST",
        body: JSON.stringify({
          gameId,
          playerId,
          responseId,
          isFavoriting,
        }),
      })

      // Update local state
      const newFavorites = new Set(favorites)
      if (isFavoriting) {
        newFavorites.add(responseId)
      } else {
        newFavorites.delete(responseId)
      }
      setFavorites(newFavorites)

      // Update counts
      const newCounts = { ...favoritesCounts }
      newCounts[responseId] = (newCounts[responseId] || 0) + (isFavoriting ? 1 : -1)
      setFavoritesCounts(newCounts)
    } catch (error) {
      console.error("Error toggling favorite:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[#4A3F35] dark:text-[#E8D8C4]">
        Responses to: {prompt}
      </h2>

      <div className="space-y-4">
        {responses.map((r, i) => {
          const responseId = r.id || `response-${i}`
          const isFavorited = favorites.has(responseId)
          const favoriteCount = favoritesCounts[responseId] || r.favoriteCount || 0

          return (
            <div
              key={i}
              className="rounded-xl bg-[#E8D8C4] dark:bg-[#3A332E] p-6 shadow-md"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-[#4A3F35] dark:text-[#E8D8C4]">
                    {r.player}
                  </p>

                  <p className="mt-1 text-sm text-[#4A3F35] dark:text-[#E8D8C4] opacity-80">
                    Mind State: <strong>{r.mindState}</strong>
                  </p>

                  <p className="mt-3 text-[#4A3F35] dark:text-[#E8D8C4] leading-relaxed">
                    {r.reflection}
                  </p>
                </div>

                {!isHost && gameId && playerId && (
                  <button
                    onClick={() => toggleFavorite(responseId)}
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

      <button
        onClick={onNext}
        className="px-6 py-3 rounded-lg bg-[#C9A27C] text-white text-lg shadow hover:opacity-90 transition"
      >
        Continue to Discussion
      </button>
    </div>
  )
}
