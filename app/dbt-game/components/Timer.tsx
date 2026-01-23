"use client"

import { useEffect, useState } from "react"

export function Timer({ seconds }: { seconds: number }) {
  const [time, setTime] = useState(seconds)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => Math.max(t - 1, 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-center text-sm text-[#6B5C52] dark:text-[#B8A89A]">
      {time}s remaining
    </div>
  )
}
