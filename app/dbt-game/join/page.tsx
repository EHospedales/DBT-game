"use client"
export const dynamic = "force-dynamic"

import { Suspense } from "react"
import JoinGameContent from "./join-content"

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="p-10 text-[#475B5A]">Loading...</div>}>
      <JoinGameContent />
    </Suspense>
  )
}