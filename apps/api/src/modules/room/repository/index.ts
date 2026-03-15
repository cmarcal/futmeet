import type { DbPool, DbClient } from '@core/framework/postgres/index.js';
import type { Player, Room } from '@futmeet/shared/types';
import { generateGameId, generatePlayerId } from '@futmeet/shared/utils';
import { RoomQuery } from '@modules/room/query/index.js';

type WriteError = {
  ok: false;
  reason: 'room_not_found' | 'room_already_started' | 'player_not_found' | 'invalid_indices';
};
type WriteOk<T> = { ok: true; data: T };
export type WriteResult<T> = WriteOk<T> | WriteError;

type RoomQueryFactory = (db: DbPool | DbClient) => RoomQuery;

export class RoomRepository {
  constructor(
    private readonly db: DbPool,
    private readonly queryFactory: RoomQueryFactory = (db) => new RoomQuery(db)
  ) {}

  async create(): Promise<Room> {
    const id = generateGameId();
    return this.queryFactory(this.db).insertRoom(id);
  }

  async findById(roomId: string): Promise<Room | null> {
    return this.queryFactory(this.db).findById(roomId);
  }

  async hasGame(roomId: string): Promise<boolean> {
    return this.queryFactory(this.db).checkRoomHasGame(roomId);
  }

  async addPlayer(roomId: string, name: string, notes?: string): Promise<WriteResult<Player>> {
    return this.withTransaction(async (q) => {
      const guard = await this.lockRoom(q, roomId);
      if (guard) return guard;
      const maxPos = await q.maxPlayerPosition(roomId);
      const id = generatePlayerId();
      const player = await q.insertPlayer(id, roomId, name, notes ?? null, maxPos + 1);
      return { ok: true, data: player };
    });
  }

  async removePlayer(roomId: string, playerId: string): Promise<WriteResult<void>> {
    return this.withTransaction(async (q) => {
      const guard = await this.lockRoom(q, roomId);
      if (guard) return guard;
      const deleted = await q.deletePlayer(playerId, roomId);
      if (!deleted) return { ok: false, reason: 'player_not_found' };
      await q.decrementPlayerPositions(roomId, deleted.position);
      return { ok: true, data: undefined };
    });
  }

  async setPriority(roomId: string, playerId: string, priority: boolean): Promise<WriteResult<Player>> {
    return this.withTransaction(async (q) => {
      const guard = await this.lockRoom(q, roomId);
      if (guard) return guard;
      const player = await q.updatePlayerPriority(roomId, playerId, priority);
      if (!player) return { ok: false, reason: 'player_not_found' };
      return { ok: true, data: player };
    });
  }

  async reorder(roomId: string, fromIndex: number, toIndex: number): Promise<WriteResult<void>> {
    return this.withTransaction(async (q) => {
      const guard = await this.lockRoom(q, roomId);
      if (guard) return guard;
      const rows = await q.selectPlayersForReorder(roomId);
      if (fromIndex < 0 || fromIndex >= rows.length || toIndex < 0 || toIndex >= rows.length) {
        return { ok: false, reason: 'invalid_indices' };
      }
      const moved = rows.splice(fromIndex, 1)[0]!;
      rows.splice(toIndex, 0, moved);
      for (let i = 0; i < rows.length; i++) {
        await q.updatePlayerPosition(rows[i]!.id, i);
      }
      return { ok: true, data: undefined };
    });
  }

  async clearPlayers(roomId: string): Promise<WriteResult<void>> {
    return this.withTransaction(async (q) => {
      const guard = await this.lockRoom(q, roomId);
      if (guard) return guard;
      await q.deleteAllPlayers(roomId);
      return { ok: true, data: undefined };
    });
  }

  private async withTransaction<T>(fn: (q: RoomQuery) => Promise<T>): Promise<T> {
    const client = await this.db.connect();
    const q = this.queryFactory(client);
    try {
      await client.query('BEGIN');
      const result = await fn(q);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  private async lockRoom(q: RoomQuery, roomId: string): Promise<WriteError | null> {
    const room = await q.selectRoomForUpdate(roomId);
    if (!room) return { ok: false, reason: 'room_not_found' };
    const hasGame = await q.checkRoomHasGame(roomId);
    if (hasGame) return { ok: false, reason: 'room_already_started' };
    return null;
  }
}
