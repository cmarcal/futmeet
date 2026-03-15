import type { DbPool, DbClient } from '@core/framework/postgres/index.js';
import type { Player, Team, Game } from '@futmeet/shared/types';
import type { GameRow, GamePlayerRow, TeamRow, TeamPlayerRow } from '@modules/game/entity/index.js';

type ServerGameStatus = 'setup' | 'complete';

export class GameQuery {
  constructor(private readonly db: DbPool | DbClient) {}

  async insertGame(id: string, roomId: string | null): Promise<GameRow> {
    const result = await this.db.query<GameRow>(
      'INSERT INTO games (id, room_id) VALUES ($1, $2) RETURNING id, room_id, team_count, game_status, created_at',
      [id, roomId]
    );
    return result.rows[0]!;
  }

  async findById(gameId: string): Promise<Game | null> {
    const gameResult = await this.db.query<GameRow>(
      'SELECT id, room_id, team_count, game_status, created_at FROM games WHERE id = $1',
      [gameId]
    );
    if (!gameResult.rows[0]) return null;

    const players = await this.selectPlayersByGame(gameId);
    const teams = await this.selectTeamsWithPlayers(gameId, players);
    return rowToGame(gameResult.rows[0], players, teams);
  }

  async selectRoomForUpdate(roomId: string): Promise<{ id: string } | null> {
    const result = await this.db.query<{ id: string }>(
      'SELECT id FROM rooms WHERE id = $1 FOR UPDATE',
      [roomId]
    );
    return result.rows[0] ?? null;
  }

  async checkRoomHasGame(roomId: string): Promise<boolean> {
    const result = await this.db.query<{ id: string }>(
      'SELECT id FROM games WHERE room_id = $1',
      [roomId]
    );
    return !!result.rows[0];
  }

  async selectPlayersByGame(gameId: string): Promise<Player[]> {
    const result = await this.db.query<GamePlayerRow>(
      'SELECT id, game_id, name, priority, notes, position, created_at FROM game_players WHERE game_id = $1 ORDER BY position',
      [gameId]
    );
    return result.rows.map(rowToPlayer);
  }

  async maxPlayerPosition(gameId: string): Promise<number> {
    const result = await this.db.query<{ max: number | null }>(
      'SELECT MAX(position) as max FROM game_players WHERE game_id = $1',
      [gameId]
    );
    return result.rows[0]?.max ?? -1;
  }

  async insertPlayer(
    id: string,
    gameId: string,
    name: string,
    priority: boolean,
    notes: string | null,
    position: number
  ): Promise<Player> {
    const result = await this.db.query<GamePlayerRow>(
      'INSERT INTO game_players (id, game_id, name, priority, notes, position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, game_id, name, priority, notes, position, created_at',
      [id, gameId, name, priority, notes, position]
    );
    return rowToPlayer(result.rows[0]!);
  }

  async deletePlayer(
    playerId: string,
    gameId: string
  ): Promise<{ position: number } | null> {
    const result = await this.db.query<{ position: number }>(
      'DELETE FROM game_players WHERE id = $1 AND game_id = $2 RETURNING position',
      [playerId, gameId]
    );
    return result.rows[0] ?? null;
  }

  async decrementPlayerPositions(gameId: string, afterPosition: number): Promise<void> {
    await this.db.query(
      'UPDATE game_players SET position = position - 1 WHERE game_id = $1 AND position > $2',
      [gameId, afterPosition]
    );
  }

  async updatePlayerPriority(
    gameId: string,
    playerId: string,
    priority: boolean
  ): Promise<Player | null> {
    const result = await this.db.query<GamePlayerRow>(
      'UPDATE game_players SET priority = $1 WHERE id = $2 AND game_id = $3 RETURNING id, game_id, name, priority, notes, position, created_at',
      [priority, playerId, gameId]
    );
    return result.rows[0] ? rowToPlayer(result.rows[0]) : null;
  }

  async selectPlayersForReorder(gameId: string): Promise<{ id: string; position: number }[]> {
    const result = await this.db.query<{ id: string; position: number }>(
      'SELECT id, position FROM game_players WHERE game_id = $1 ORDER BY position',
      [gameId]
    );
    return result.rows;
  }

  async updatePlayerPosition(playerId: string, position: number): Promise<void> {
    await this.db.query(
      'UPDATE game_players SET position = $1 WHERE id = $2',
      [position, playerId]
    );
  }

  async updateTeamCount(gameId: string, teamCount: number): Promise<GameRow | null> {
    const result = await this.db.query<GameRow>(
      'UPDATE games SET team_count = $1 WHERE id = $2 RETURNING id, room_id, team_count, game_status, created_at',
      [teamCount, gameId]
    );
    return result.rows[0] ?? null;
  }

  async updateGameStatus(gameId: string, status: ServerGameStatus): Promise<void> {
    await this.db.query(
      'UPDATE games SET game_status = $1 WHERE id = $2',
      [status, gameId]
    );
  }

  async deleteTeamsByGame(gameId: string): Promise<void> {
    await this.db.query('DELETE FROM teams WHERE game_id = $1', [gameId]);
  }

  async insertTeam(id: string, gameId: string, name: string, position: number): Promise<void> {
    await this.db.query(
      'INSERT INTO teams (id, game_id, name, position) VALUES ($1, $2, $3, $4)',
      [id, gameId, name, position]
    );
  }

  async insertTeamPlayer(teamId: string, gamePlayerId: string): Promise<void> {
    await this.db.query(
      'INSERT INTO team_players (team_id, game_player_id) VALUES ($1, $2)',
      [teamId, gamePlayerId]
    );
  }

  async selectTeamsWithPlayers(gameId: string, players: Player[]): Promise<Team[]> {
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

const rowToPlayer = (row: GamePlayerRow): Player => ({
  id: row.id,
  name: row.name,
  priority: row.priority,
  notes: row.notes ?? undefined,
  timestamp: row.created_at,
});

const rowToGame = (row: GameRow, players: Player[], teams: Team[]): Game => ({
  id: row.id,
  roomId: row.room_id,
  players,
  teamCount: row.team_count,
  gameStatus: row.game_status as ServerGameStatus,
  teams,
  createdAt: row.created_at,
});
