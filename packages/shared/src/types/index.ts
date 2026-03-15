// GameStatus: 'sorting' is frontend-only transient state; backend only stores 'setup' | 'complete'
export type GameStatus = 'setup' | 'sorting' | 'complete';
export type ServerGameStatus = 'setup' | 'complete';

export interface Player {
  id: string; // UUID (crypto.randomUUID())
  name: string;
  timestamp: Date;
  priority: boolean;
  notes?: string;
}

export interface Team {
  id: string; // UUID
  name: string;
  players: Player[];
}

export interface Room {
  id: string; // nanoid 21-char alphanumeric
  players: Player[];
  createdAt: Date;
}

export interface Game {
  id: string; // nanoid 21-char alphanumeric
  roomId: string | null;
  players: Player[];
  teamCount: number;
  gameStatus: ServerGameStatus;
  teams: Team[];
  createdAt: Date;
}
