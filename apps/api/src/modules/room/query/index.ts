import type { DbPool, DbClient } from '@core/framework/postgres/index.js';
import type { Player, Room } from '@futmeet/shared/types';
import type { RoomRow, RoomPlayerRow } from '@modules/room/entity/index.js';

export class RoomQuery {
  constructor(private readonly db: DbPool | DbClient) {}

  async insertRoom(id: string): Promise<Room> {
    const result = await this.db.query<RoomRow>(
      'INSERT INTO rooms (id) VALUES ($1) RETURNING id, created_at',
      [id]
    );
    return rowToRoom(result.rows[0]!, []);
  }

  async findById(roomId: string): Promise<Room | null> {
    const roomResult = await this.db.query<RoomRow>(
      'SELECT id, created_at FROM rooms WHERE id = $1',
      [roomId]
    );
    if (!roomResult.rows[0]) return null;

    const players = await this.selectPlayersByRoom(roomId);
    return rowToRoom(roomResult.rows[0], players);
  }

  async selectRoomForUpdate(roomId: string): Promise<{ id: string } | null> {
    const result = await this.db.query<{ id: string }>(
      'SELECT id FROM rooms WHERE id = $1 FOR UPDATE',
      [roomId]
    );
    return result.rows[0] ?? null;
  }

  async checkRoomHasGame(roomId: string): Promise<boolean> {
    const result = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM games WHERE room_id = $1',
      [roomId]
    );
    return parseInt(result.rows[0]?.count ?? '0', 10) > 0;
  }

  async selectPlayersByRoom(roomId: string): Promise<Player[]> {
    const result = await this.db.query<RoomPlayerRow>(
      'SELECT id, room_id, name, priority, notes, position, created_at FROM room_players WHERE room_id = $1 ORDER BY position',
      [roomId]
    );
    return result.rows.map(rowToPlayer);
  }

  async maxPlayerPosition(roomId: string): Promise<number> {
    const result = await this.db.query<{ max: number | null }>(
      'SELECT MAX(position) as max FROM room_players WHERE room_id = $1',
      [roomId]
    );
    return result.rows[0]?.max ?? -1;
  }

  async insertPlayer(
    id: string,
    roomId: string,
    name: string,
    notes: string | null,
    position: number
  ): Promise<Player> {
    const result = await this.db.query<RoomPlayerRow>(
      `INSERT INTO room_players (id, room_id, name, notes, position)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, room_id, name, priority, notes, position, created_at`,
      [id, roomId, name, notes, position]
    );
    return rowToPlayer(result.rows[0]!);
  }

  async deletePlayer(
    playerId: string,
    roomId: string
  ): Promise<{ position: number } | null> {
    const result = await this.db.query<{ position: number }>(
      'DELETE FROM room_players WHERE id = $1 AND room_id = $2 RETURNING position',
      [playerId, roomId]
    );
    return result.rows[0] ?? null;
  }

  async decrementPlayerPositions(
    roomId: string,
    afterPosition: number
  ): Promise<void> {
    await this.db.query(
      'UPDATE room_players SET position = position - 1 WHERE room_id = $1 AND position > $2',
      [roomId, afterPosition]
    );
  }

  async updatePlayerPriority(
    roomId: string,
    playerId: string,
    priority: boolean
  ): Promise<Player | null> {
    const result = await this.db.query<RoomPlayerRow>(
      `UPDATE room_players SET priority = $1
       WHERE id = $2 AND room_id = $3
       RETURNING id, room_id, name, priority, notes, position, created_at`,
      [priority, playerId, roomId]
    );
    return result.rows[0] ? rowToPlayer(result.rows[0]) : null;
  }

  async selectPlayersForReorder(
    roomId: string
  ): Promise<{ id: string; position: number }[]> {
    const result = await this.db.query<{ id: string; position: number }>(
      'SELECT id, position FROM room_players WHERE room_id = $1 ORDER BY position',
      [roomId]
    );
    return result.rows;
  }

  async updatePlayerPosition(playerId: string, position: number): Promise<void> {
    await this.db.query(
      'UPDATE room_players SET position = $1 WHERE id = $2',
      [position, playerId]
    );
  }

  async deleteAllPlayers(roomId: string): Promise<void> {
    await this.db.query(
      'DELETE FROM room_players WHERE room_id = $1',
      [roomId]
    );
  }
}

const rowToPlayer = (row: RoomPlayerRow): Player => ({
  id: row.id,
  name: row.name,
  priority: row.priority,
  notes: row.notes ?? undefined,
  timestamp: row.created_at,
});

const rowToRoom = (row: RoomRow, players: Player[]): Room => ({
  id: row.id,
  players,
  createdAt: row.created_at,
});
