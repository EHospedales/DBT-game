"use client"

export const dynamic = "force-dynamic"

import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-[#FAFAF7]">
      <h1 className="text-4xl font-bold text-[#2F3E46] mb-6">
        DBT Group Game
      </h1>

      <p className="text-lg text-[#475B5A] mb-10 max-w-md text-center">
        A calm, reflective space for practicing DBT skills together.
      </p>

      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={() => router.push("/dbt-game/host")}
          className="w-full bg-[#A3B18A] text-white p-4 rounded-xl shadow hover:bg-[#588157] transition"
        >
          Host a Game
        </button>

        <button
          onClick={() => router.push("/dbt-game/enter")}
          className="w-full bg-[#F5F5F0] text-[#2F3E46] p-4 rounded-xl shadow border border-[#DDE2D9] hover:bg-[#E8EAE4] transition"
        >
          Join a Game
        </button>
      </div>
    </div>
  )
}
