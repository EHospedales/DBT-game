export function PlayerList({ players }: { players: string[] }) {
  return (
    <div className="space-y-2">
      {players.map((p) => (
        <div
          key={p}
          className="rounded-lg bg-[#F7F1EB] dark:bg-[#2A2623] px-4 py-2 border border-[#E8D8C4] dark:border-[#3A332E]"
        >
          <span className="text-[#4A3F35] dark:text-[#E8D8C4]">{p}</span>
        </div>
      ))}
    </div>
  )
}
