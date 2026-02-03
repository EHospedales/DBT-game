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
        "bg-[#F5F5F0] dark:bg-[#2A2623]",
        "shadow-sm hover:shadow-md hover:border-[#A3B18A]",
        "border border-[#DDE2D9] dark:border-[#3A332E]",
        selected && "ring-2 ring-[#A3B18A] bg-[#F0F7E8]",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-[#2F3E46] dark:text-[#E8EAE4]">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-[#475B5A] dark:text-[#C9D4C7]">
          {description}
        </p>
      )}
    </button>
  )
}
