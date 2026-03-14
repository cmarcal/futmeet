import type { DbPool } from '@core/framework/postgres/index.js';
import type { Player, Room } from '@futmeet/shared/types';
import type { RoomRow, RoomPlayerRow } from '@modules/room/entity/index.js';
import { generateGameId, generatePlayerId } from '@futmeet/shared/utils';

export class RoomRepository {
  constructor(private readonly db: DbPool) {}

  async create(): Promise<Room> {
    const id = generateGameId();
    const result = await this.db.query<RoomRow>(
      'INSERT INTO rooms (id) VALUES ($1) RETURNING id, created_at',
      [id]
    );
    return { id: result.rows[0]!.id, players: [], createdAt: result.rows[0]!.created_at };
  }

  async findById(roomId: string): Promise<Room | null> {
    const roomResult = await this.db.query<RoomRow>(
      'SELECT id, created_at FROM rooms WHERE id = $1',
      [roomId]
    );
    if (!roomResult.rows[0]) return null;

    const players = await this.getPlayers(roomId);
    return { id: roomResult.rows[0].id, players, createdAt: roomResult.rows[0].created_at };
  }

  async addPlayer(roomId: string, name: string, notes?: string): Promise<Player> {
    const id = generatePlayerId();
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const posResult = await client.query<{ max: number | null }>(
        'SELECT MAX(position) as max FROM room_players WHERE room_id = $1',
        [roomId]
      );
      const position = (posResult.rows[0]?.max ?? -1) + 1;
      const result = await client.query<RoomPlayerRow>(
        `INSERT INTO room_players (id, room_id, name, notes, position)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, room_id, name, priority, notes, position, created_at`,
        [id, roomId, name, notes ?? null, position]
      );
      await client.query('COMMIT');
      return rowToPlayer(result.rows[0]!);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async removePlayer(roomId: string, playerId: string): Promise<boolean> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const deleted = await client.query<RoomPlayerRow>(
        'DELETE FROM room_players WHERE id = $1 AND room_id = $2 RETURNING position',
        [playerId, roomId]
      );
      if (!deleted.rows[0]) {
        await client.query('ROLLBACK');
        return false;
      }
      const deletedPos = deleted.rows[0].position;
      await client.query(
        'UPDATE room_players SET position = position - 1 WHERE room_id = $1 AND position > $2',
        [roomId, deletedPos]
      );
      await client.query('COMMIT');
      return true;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async setPriority(roomId: string, playerId: string, priority: boolean): Promise<Player | null> {
    const result = await this.db.query<RoomPlayerRow>(
      `UPDATE room_players SET priority = $1
       WHERE id = $2 AND room_id = $3
       RETURNING id, room_id, name, priority, notes, position, created_at`,
      [priority, playerId, roomId]
    );
    return result.rows[0] ? rowToPlayer(result.rows[0]) : null;
  }

  async reorder(roomId: string, fromIndex: number, toIndex: number): Promise<boolean> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const players = await client.query<RoomPlayerRow>(
        'SELECT id, position FROM room_players WHERE room_id = $1 ORDER BY position',
        [roomId]
      );
      const rows = players.rows;
      if (fromIndex < 0 || fromIndex >= rows.length || toIndex < 0 || toIndex >= rows.length) {
        await client.query('ROLLBACK');
        return false;
      }

      const moved = rows.splice(fromIndex, 1)[0]!;
      rows.splice(toIndex, 0, moved);

      for (let i = 0; i < rows.length; i++) {
        await client.query(
          'UPDATE room_players SET position = $1 WHERE id = $2',
          [i, rows[i]!.id]
        );
      }
      await client.query('COMMIT');
      return true;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async clearPlayers(roomId: string): Promise<void> {
    await this.db.query('DELETE FROM room_players WHERE room_id = $1', [roomId]);
  }

  async hasGame(roomId: string): Promise<boolean> {
    const result = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM games WHERE room_id = $1',
      [roomId]
    );
    return parseInt(result.rows[0]?.count ?? '0', 10) > 0;
  }

  private async getPlayers(roomId: string): Promise<Player[]> {
    const result = await this.db.query<RoomPlayerRow>(
      'SELECT id, room_id, name, priority, notes, position, created_at FROM room_players WHERE room_id = $1 ORDER BY position',
      [roomId]
    );
    return result.rows.map(rowToPlayer);
  }
}

const rowToPlayer = (row: RoomPlayerRow): Player => ({
  id: row.id,
  name: row.name,
  priority: row.priority,
  notes: row.notes ?? undefined,
  timestamp: row.created_at,
});
