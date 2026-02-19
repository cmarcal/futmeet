export interface Player {
  id: string
  name: string
  timestamp: Date
  priority: boolean
  notes?: string
}

export interface Team {
  id: string
  name: string
  players: Player[]
}

export type GameStatus = 'setup' | 'sorting' | 'complete'

export interface PlayerListActions {
  players: Player[]
  addPlayer: (name: string) => void
  removePlayer: (playerId: string) => void
  togglePriority: (playerId: string) => void
  reorderPlayers: (fromIndex: number, toIndex: number) => void
}
