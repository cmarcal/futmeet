export type { Player, Team, Game, ServerGameStatus } from '@futmeet/shared/types';

export interface GameRow {
  id: string;
  room_id: string | null;
  team_count: number;
  game_status: 'setup' | 'complete';
  created_at: Date;
}

export interface GamePlayerRow {
  id: string;
  game_id: string;
  name: string;
  priority: boolean;
  notes: string | null;
  position: number;
  created_at: Date;
}

export interface TeamRow {
  id: string;
  game_id: string;
  name: string;
  position: number;
}

export interface TeamPlayerRow {
  team_id: string;
  game_player_id: string;
}
