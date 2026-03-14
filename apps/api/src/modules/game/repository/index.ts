import { GameQuery } from '@modules/game/query/index.js';
import type { DbPool, DbClient } from '@core/framework/postgres/index.js';
import type { Player, Game } from '@futmeet/shared/types';
import { generateGameId, generatePlayerId, sortTeams } from '@futmeet/shared/utils';

type GameQueryFactory = (db: DbPool | DbClient) => GameQuery;

type CreateFromRoomError = { ok: false; reason: 'room_not_found' | 'room_already_started' };
type CreateFromRoomOk = { ok: true; data: Game };
export type CreateFromRoomResult = CreateFromRoomOk | CreateFromRoomError;

export class GameRepository {
  constructor(
    private readonly db: DbPool,
    private readonly queryFactory: GameQueryFactory = (db) => new GameQuery(db)
  ) {}

  private async withTransaction<T>(fn: (q: GameQuery) => Promise<T>): Promise<T> {
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

  async create(roomId?: string): Promise<Game> {
    const id = generateGameId();
    const row = await this.queryFactory(this.db).insertGame(id, roomId ?? null);
    return {
      id: row.id,
      roomId: row.room_id,
      players: [],
      teamCount: row.team_count,
      gameStatus: row.game_status,
      teams: [],
      createdAt: row.created_at,
    };
  }

  async findById(gameId: string): Promise<Game | null> {
    return this.queryFactory(this.db).findById(gameId);
  }

  async createFromRoom(roomId: string, players: Player[]): Promise<CreateFromRoomResult> {
    return this.withTransaction(async (q) => {
      const room = await q.selectRoomForUpdate(roomId);
      if (!room) return { ok: false, reason: 'room_not_found' };

      const hasGame = await q.checkRoomHasGame(roomId);
      if (hasGame) return { ok: false, reason: 'room_already_started' };

      const id = generateGameId();
      const gameRow = await q.insertGame(id, roomId);

      for (let i = 0; i < players.length; i++) {
        const player = players[i]!;
        const playerId = generatePlayerId();
        await q.insertPlayer(playerId, id, player.name, player.priority, player.notes ?? null, i);
      }

      return {
        ok: true,
        data: {
          id: gameRow.id,
          roomId: gameRow.room_id,
          players,
          teamCount: gameRow.team_count,
          gameStatus: gameRow.game_status,
          teams: [],
          createdAt: gameRow.created_at,
        },
      };
    });
  }

  async addPlayer(gameId: string, name: string, notes?: string): Promise<Player> {
    return this.withTransaction(async (q) => {
      const position = await q.maxPlayerPosition(gameId);
      const id = generatePlayerId();
      return q.insertPlayer(id, gameId, name, false, notes ?? null, position + 1);
    });
  }

  async removePlayer(gameId: string, playerId: string): Promise<boolean> {
    return this.withTransaction(async (q) => {
      const deleted = await q.deletePlayer(playerId, gameId);
      if (!deleted) return false;
      await q.decrementPlayerPositions(gameId, deleted.position);
      return true;
    });
  }

  async setPriority(gameId: string, playerId: string, priority: boolean): Promise<Player | null> {
    return this.queryFactory(this.db).updatePlayerPriority(gameId, playerId, priority);
  }

  async reorder(gameId: string, fromIndex: number, toIndex: number): Promise<boolean> {
    return this.withTransaction(async (q) => {
      const rows = await q.selectPlayersForReorder(gameId);
      if (
        fromIndex < 0 ||
        fromIndex >= rows.length ||
        toIndex < 0 ||
        toIndex >= rows.length
      ) {
        return false;
      }
      const moved = rows.splice(fromIndex, 1)[0]!;
      rows.splice(toIndex, 0, moved);
      for (let i = 0; i < rows.length; i++) {
        await q.updatePlayerPosition(rows[i]!.id, i);
      }
      return true;
    });
  }

  async setTeamCount(gameId: string, teamCount: number): Promise<Game | null> {
    return this.withTransaction(async (q) => {
      const gameRow = await q.updateTeamCount(gameId, teamCount);
      if (!gameRow) return null;
      const players = await q.selectPlayersByGame(gameId);
      const teams = await q.selectTeamsWithPlayers(gameId, players);
      return {
        id: gameRow.id,
        roomId: gameRow.room_id,
        players,
        teamCount: gameRow.team_count,
        gameStatus: gameRow.game_status,
        teams,
        createdAt: gameRow.created_at,
      };
    });
  }

  async sort(gameId: string): Promise<Game | null> {
    const game = await this.queryFactory(this.db).findById(gameId);
    if (!game) return null;

    const sortedTeams = sortTeams(game.players, game.teamCount);

    return this.withTransaction(async (q) => {
      await q.deleteTeamsByGame(gameId);

      for (let i = 0; i < sortedTeams.length; i++) {
        const team = sortedTeams[i]!;
        const teamId = generatePlayerId();
        await q.insertTeam(teamId, gameId, team.name, i + 1);
        for (const player of team.players) {
          await q.insertTeamPlayer(teamId, player.id);
        }
        team.id = teamId;
      }

      await q.updateGameStatus(gameId, 'complete');

      return {
        ...game,
        gameStatus: 'complete' as const,
        teams: sortedTeams,
      };
    });
  }
}
