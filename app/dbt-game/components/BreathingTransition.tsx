"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"

export function BreathingTransition({
  onComplete,
  duration = 1500,
}: {
  onComplete: () => void
  duration?: number
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onComplete()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F7F1EB]/90 dark:bg-black/60 z-50 fade-in">
      <div className="flex flex-col items-center space-y-6">
        <div className="w-32 h-32 rounded-full bg-[#C9A27C]/40 animate-[pulse_1.5s_ease-in-out_infinite]"></div>

        <p className="text-xl text-[#4A3F35] dark:text-[#E8D8C4] fade-in">
          Take a breath…
        </p>
      </div>
    </div>
  )
}
