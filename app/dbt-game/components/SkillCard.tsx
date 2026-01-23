"use client"

import { cn } from "@/lib/utils"

export function SkillCard({
  title,
  description,
  onClick,
  selected = false,
  className,
}: {
  title: string
  description?: string
  onClick?: () => void
  selected?: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl p-5 transition-all",
        "bg-[#F7F1EB] dark:bg-[#2A2623]",
        "shadow-sm hover:shadow-md",
        "border border-[#E8D8C4] dark:border-[#3A332E]",
        selected && "ring-2 ring-[#C9A27C]",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-[#4A3F35] dark:text-[#E8D8C4]">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-[#6B5C52] dark:text-[#B8A89A]">
          {description}
        </p>
      )}
    </button>
  )
}
