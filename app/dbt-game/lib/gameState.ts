export type GamePhase = "lobby" | "prompt" | "reveal" | "discussion" | "end"

export type GameState = {
  id: string
  hostId: string
  players: string[]
  currentRound: number
  prompt: string | null
  responses: Record<string, string>
  phase: GamePhase
}
