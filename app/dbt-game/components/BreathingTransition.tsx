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
export function BreathingTransition({
  onComplete,
  duration = 1500,
}: {
  onComplete: () => void
  duration?: number
}) {
  const [isVisible, setIsVisible] = useState(true)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      // Wait for fade out animation before calling onComplete and unmounting
      setTimeout(() => {
        onComplete()
        setShouldRender(false)
      }, 300) // Allow time for fade out transition
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  if (!shouldRender) return null

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-[#F7F1EB]/90 dark:bg-black/60 z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="w-32 h-32 rounded-full bg-[#C9A27C]/40 animate-[pulse_1.5s_ease-in-out_infinite]"></div>

        <p className="text-xl text-[#4A3F35] dark:text-[#E8D8C4] fade-in">
          Take a breath…
        </p>
      </div>
    </div>
  )
}
}
