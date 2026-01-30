"use client"

interface LeaderboardProps {
  scores: Record<string, number>
  players: Array<{ id: string; name: string }>
  currentPlayerId?: string
}

export function Leaderboard({ scores, players, currentPlayerId }: LeaderboardProps) {
  // Create sorted leaderboard
  const leaderboard = players
    .map(player => ({
      id: player.id,
      name: player.name,
      score: scores[player.id] || 0
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

            <div className={`text-lg font-bold ${
              player.id === currentPlayerId ? "text-white" : "text-[#2F3E46]"
            }`}>
              {player.score} pts
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