import type { DbPool } from '@core/framework/postgres/index.js';
import type { Player, Team, Game, ServerGameStatus } from '@futmeet/shared/types';
import type { GameRow, GamePlayerRow, TeamRow, TeamPlayerRow } from '@modules/game/entity/index.js';
import { generateGameId, generatePlayerId } from '@futmeet/shared/utils';
import { sortTeams } from '@futmeet/shared/utils';

export class GameRepository {
  constructor(private readonly db: DbPool) {}

  async create(roomId?: string): Promise<Game> {
    const id = generateGameId();
    const result = await this.db.query<GameRow>(
      'INSERT INTO games (id, room_id) VALUES ($1, $2) RETURNING id, room_id, team_count, game_status, created_at',
      [id, roomId ?? null]
    );
    return rowToGame(result.rows[0]!, [], []);
  }

  async createFromRoom(roomId: string, players: Player[]): Promise<Game> {
    const id = generateGameId();
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const gameResult = await client.query<GameRow>(
        'INSERT INTO games (id, room_id) VALUES ($1, $2) RETURNING id, room_id, team_count, game_status, created_at',
        [id, roomId]
      );
      const game = gameResult.rows[0]!;

      for (const player of players) {
        const playerId = generatePlayerId();
        await client.query(
          'INSERT INTO game_players (id, game_id, name, priority, notes, position) VALUES ($1, $2, $3, $4, $5, $6)',
          [playerId, id, player.name, player.priority, player.notes ?? null, players.indexOf(player)]
        );
      }

      await client.query('COMMIT');
      return rowToGame(game, players, []);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async findById(gameId: string): Promise<Game | null> {
    const gameResult = await this.db.query<GameRow>(
      'SELECT id, room_id, team_count, game_status, created_at FROM games WHERE id = $1',
      [gameId]
    );
    if (!gameResult.rows[0]) return null;

    const players = await this.getPlayers(gameId);
    const teams = await this.getTeams(gameId, players);
    return rowToGame(gameResult.rows[0], players, teams);
  }

  async addPlayer(gameId: string, name: string, notes?: string): Promise<Player> {
    const id = generatePlayerId();
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const posResult = await client.query<{ max: number | null }>(
        'SELECT MAX(position) as max FROM game_players WHERE game_id = $1',
        [gameId]
      );
      const position = (posResult.rows[0]?.max ?? -1) + 1;
      const result = await client.query<GamePlayerRow>(
        'INSERT INTO game_players (id, game_id, name, notes, position) VALUES ($1, $2, $3, $4, $5) RETURNING id, game_id, name, priority, notes, position, created_at',
        [id, gameId, name, notes ?? null, position]
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

  async removePlayer(gameId: string, playerId: string): Promise<boolean> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const deleted = await client.query<GamePlayerRow>(
        'DELETE FROM game_players WHERE id = $1 AND game_id = $2 RETURNING position',
        [playerId, gameId]
      );
      if (!deleted.rows[0]) {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        'UPDATE game_players SET position = position - 1 WHERE game_id = $1 AND position > $2',
        [gameId, deleted.rows[0].position]
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

  async setPriority(gameId: string, playerId: string, priority: boolean): Promise<Player | null> {
    const result = await this.db.query<GamePlayerRow>(
      'UPDATE game_players SET priority = $1 WHERE id = $2 AND game_id = $3 RETURNING id, game_id, name, priority, notes, position, created_at',
      [priority, playerId, gameId]
    );
    return result.rows[0] ? rowToPlayer(result.rows[0]) : null;
  }

  async reorder(gameId: string, fromIndex: number, toIndex: number): Promise<boolean> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const players = await client.query<GamePlayerRow>(
        'SELECT id, position FROM game_players WHERE game_id = $1 ORDER BY position',
        [gameId]
      );
      const rows = players.rows;
      if (fromIndex < 0 || fromIndex >= rows.length || toIndex < 0 || toIndex >= rows.length) {
        await client.query('ROLLBACK');
        return false;
      }
      const moved = rows.splice(fromIndex, 1)[0]!;
      rows.splice(toIndex, 0, moved);
      for (let i = 0; i < rows.length; i++) {
        await client.query('UPDATE game_players SET position = $1 WHERE id = $2', [i, rows[i]!.id]);
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

  async setTeamCount(gameId: string, teamCount: number): Promise<Game | null> {
    const result = await this.db.query<GameRow>(
      'UPDATE games SET team_count = $1 WHERE id = $2 RETURNING id, room_id, team_count, game_status, created_at',
      [teamCount, gameId]
    );
    if (!result.rows[0]) return null;
    const players = await this.getPlayers(gameId);
    const teams = await this.getTeams(gameId, players);
    return rowToGame(result.rows[0], players, teams);
  }

  async sort(gameId: string): Promise<Game | null> {
    const gameResult = await this.db.query<GameRow>(
      'SELECT id, room_id, team_count, game_status, created_at FROM games WHERE id = $1',
      [gameId]
    );
    if (!gameResult.rows[0]) return null;

    const players = await this.getPlayers(gameId);
    const teamCount = gameResult.rows[0].team_count;
    const sortedTeams = sortTeams(players, teamCount);

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      // Delete existing teams (cascades to team_players)
      await client.query('DELETE FROM teams WHERE game_id = $1', [gameId]);

      // Insert new teams and junction rows
      for (let i = 0; i < sortedTeams.length; i++) {
        const team = sortedTeams[i]!;
        const teamId = generatePlayerId();
        await client.query(
          'INSERT INTO teams (id, game_id, name, position) VALUES ($1, $2, $3, $4)',
          [teamId, gameId, team.name, i + 1]
        );
        for (const player of team.players) {
          await client.query(
            'INSERT INTO team_players (team_id, game_player_id) VALUES ($1, $2)',
            [teamId, player.id]
          );
        }
        // update team id to persisted id for response
        team.id = teamId;
      }

      await client.query(
        "UPDATE games SET game_status = 'complete' WHERE id = $1",
        [gameId]
      );
      await client.query('COMMIT');
      return rowToGame({ ...gameResult.rows[0], game_status: 'complete' }, players, sortedTeams);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  private async getPlayers(gameId: string): Promise<Player[]> {
    const result = await this.db.query<GamePlayerRow>(
      'SELECT id, game_id, name, priority, notes, position, created_at FROM game_players WHERE game_id = $1 ORDER BY position',
      [gameId]
    );
    return result.rows.map(rowToPlayer);
  }

  private async getTeams(gameId: string, players: Player[]): Promise<Team[]> {
    const teamRows = await this.db.query<TeamRow>(
      'SELECT id, game_id, name, position FROM teams WHERE game_id = $1 ORDER BY position',
      [gameId]
    );
    if (!teamRows.rows.length) return [];

    const junctionRows = await this.db.query<TeamPlayerRow>(
      `SELECT tp.team_id, tp.game_player_id FROM team_players tp
       JOIN teams t ON t.id = tp.team_id WHERE t.game_id = $1`,
      [gameId]
    );

    const playerMap = new Map(players.map((p) => [p.id, p]));

    return teamRows.rows.map((teamRow) => ({
      id: teamRow.id,
      name: teamRow.name,
      players: junctionRows.rows
        .filter((jr) => jr.team_id === teamRow.id)
        .map((jr) => playerMap.get(jr.game_player_id)!)
        .filter(Boolean),
    }));
  }
}

const rowToGame = (row: GameRow, players: Player[], teams: Team[]): Game => ({
  id: row.id,
  roomId: row.room_id,
  players,
  teamCount: row.team_count,
  gameStatus: row.game_status as ServerGameStatus,
  teams,
  createdAt: row.created_at,
});

const rowToPlayer = (row: GamePlayerRow): Player => ({
  id: row.id,
  name: row.name,
  priority: row.priority,
  notes: row.notes ?? undefined,
  timestamp: row.created_at,
});

type ServerGameStatus = 'setup' | 'complete';
