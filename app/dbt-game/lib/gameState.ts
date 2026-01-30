export type GamePhase = "lobby" | "prompt" | "reveal" | "discussion" | "end" | "opposite_action_race" | "race_reveal"

export type GameMode = "reflection" | "opposite_action_race"

export type GameState = {
  id: string
  hostId: string
  players: string[]
  currentRound: number
  prompt: string | null
  responses: Record<string, string>
  phase: GamePhase
  mode: GameMode
  scores: Record<string, number> // player_id -> score
  racePrompt?: {
    emotion: string
    scenario: string
    urge: string
  }
  raceWinner?: string // player_id of winner
  raceResponses?: Array<{
    playerId: string
    playerName: string
    action: string
    timestamp: number
  }>
}
