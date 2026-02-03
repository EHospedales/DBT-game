export function PlayerList({ players }: { players: string[] }) {
  return (
    <div className="space-y-2">
      {players.map((p) => (
        <div
          key={p}
          className="rounded-lg bg-[#F5F5F0] dark:bg-[#2A2623] px-4 py-2 border border-[#DDE2D9] dark:border-[#3A332E]"
        >
          <span className="text-[#2F3E46] dark:text-[#E8EAE4]">{p}</span>
        </div>
      ))}
    </div>
  )
}
