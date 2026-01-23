"use client"

export const dynamic = "force-dynamic"

import { Suspense } from "react"
import WaitingContent from "./waiting-content"

export default function WaitingRoom() {
  return (
    <Suspense fallback={<div className="p-10 text-[#475B5A]">Loading...</div>}>
      <WaitingContent />
    </Suspense>
  )
}
