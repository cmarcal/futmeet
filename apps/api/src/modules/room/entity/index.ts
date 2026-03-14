export type { Player, Room } from '@futmeet/shared/types';

export interface RoomPlayerRow {
  id: string;
  room_id: string;
  name: string;
  priority: boolean;
  notes: string | null;
  position: number;
  created_at: Date;
}

export interface RoomRow {
  id: string;
  created_at: Date;
}
