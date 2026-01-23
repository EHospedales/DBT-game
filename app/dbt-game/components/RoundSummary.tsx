"use client"

export function RoundSummary({
  prompt,
  responses,
  onNext,
}: {
  prompt: string
  responses: {
    player: string
    mindState: string
    reflection: string
  }[]
  onNext: () => void
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[#4A3F35] dark:text-[#E8D8C4]">
        Responses to: {prompt}
      </h2>

      <div className="space-y-4">
        {responses.map((r, i) => (
          <div
            key={i}
            className="rounded-xl bg-[#E8D8C4] dark:bg-[#3A332E] p-6 shadow-md"
          >
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
        ))}
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
