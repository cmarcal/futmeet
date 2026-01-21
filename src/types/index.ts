// TypeScript type definitions for FutMeet

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
