export function PromptCard({
  prompt,
}: {
  prompt: string
}) {
  return (
    <div className="rounded-2xl p-6 bg-[#F5F5F0] dark:bg-[#2A2623] shadow-md border border-[#DDE2D9] dark:border-[#3A332E]">
      <p className="text-xl text-[#2F3E46] dark:text-[#E8EAE4] leading-relaxed">
        {prompt}
      </p>
    </div>
  )
}
