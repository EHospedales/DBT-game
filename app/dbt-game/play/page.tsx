"use client"

export const dynamic = "force-dynamic"

import { Suspense } from "react"
import PlayContent from "./play-content"

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="p-10 text-[#475B5A]">Loading...</div>}>
      <PlayContent />
    </Suspense>
  )
}