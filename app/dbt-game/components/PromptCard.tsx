export function PromptCard({
  prompt,
}: {
  prompt: string
}) {
  return (
    <div className="rounded-2xl p-6 bg-[#E8D8C4] dark:bg-[#3A332E] shadow-md">
      <p className="text-xl text-[#4A3F35] dark:text-[#E8D8C4] leading-relaxed">
        {prompt}
      </p>
    </div>
  )
}
