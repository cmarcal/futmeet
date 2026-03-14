import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameQuery } from '../index.js';

const mockDb = { query: vi.fn() };
const q = new GameQuery(mockDb as any);

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const gameRow = {
  id: 'game-1',
  room_id: 'room-1',
  team_count: 2,
  game_status: 'setup' as const,
  created_at: new Date('2024-01-01'),
};

const playerRow = {
  id: 'player-1',
  game_id: 'game-1',
  name: 'Alice',
  priority: false,
  notes: null,
  position: 0,
  created_at: new Date('2024-01-01'),
};

const player = {
  id: 'player-1',
  name: 'Alice',
  priority: false,
  notes: undefined,
  timestamp: playerRow.created_at,
};

const teamRow = { id: 'team-1', game_id: 'game-1', name: 'Team A', position: 1 };

// ---------------------------------------------------------------------------
// insertGame
// ---------------------------------------------------------------------------

describe('GameQuery.insertGame', () => {
  it('executes INSERT and returns the raw GameRow', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [gameRow] });

    const result = await q.insertGame('game-1', 'room-1');

    expect(mockDb.query).toHaveBeenCalledOnce();
    expect(mockDb.query).toHaveBeenCalledWith(
      'INSERT INTO games (id, room_id) VALUES ($1, $2) RETURNING id, room_id, team_count, game_status, created_at',
      ['game-1', 'room-1']
    );
    expect(result).toEqual(gameRow);
  });

  it('passes null roomId through to the query', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ ...gameRow, room_id: null }] });

    await q.insertGame('game-1', null);

    expect(mockDb.query).toHaveBeenCalledWith(
      expect.any(String),
      ['game-1', null]
    );
  });
});

// ---------------------------------------------------------------------------
// findById
// ---------------------------------------------------------------------------

describe('GameQuery.findById', () => {
  it('returns null when game row is not found', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    const result = await q.findById('game-1');

    expect(mockDb.query).toHaveBeenCalledOnce();
    expect(result).toBeNull();
  });

  it('queries game, players and teams in order and returns assembled Game', async () => {
    // 1. SELECT game
    mockDb.query.mockResolvedValueOnce({ rows: [gameRow] });
    // 2. SELECT players (via selectPlayersByGame)
    mockDb.query.mockResolvedValueOnce({ rows: [playerRow] });
    // 3. SELECT teams (via selectTeamsWithPlayers — teams query)
    mockDb.query.mockResolvedValueOnce({ rows: [] }); // no teams → short-circuits

    const result = await q.findById('game-1');

    expect(mockDb.query).toHaveBeenCalledTimes(3);

    // First call: fetch game
    expect(mockDb.query).toHaveBeenNthCalledWith(
      1,
      'SELECT id, room_id, team_count, game_status, created_at FROM games WHERE id = $1',
      ['game-1']
    );
    // Second call: fetch players
    expect(mockDb.query).toHaveBeenNthCalledWith(
      2,
      'SELECT id, game_id, name, priority, notes, position, created_at FROM game_players WHERE game_id = $1 ORDER BY position',
      ['game-1']
    );
    // Third call: fetch teams
    expect(mockDb.query).toHaveBeenNthCalledWith(
      3,
      'SELECT id, game_id, name, position FROM teams WHERE game_id = $1 ORDER BY position',
      ['game-1']
    );

    expect(result).toEqual({
      id: 'game-1',
      roomId: 'room-1',
      teamCount: 2,
      gameStatus: 'setup',
      players: [player],
      teams: [],
      createdAt: gameRow.created_at,
    });
  });

  it('assembles teams when they exist', async () => {
    const junctionRow = { team_id: 'team-1', game_player_id: 'player-1' };

    mockDb.query.mockResolvedValueOnce({ rows: [gameRow] });
    mockDb.query.mockResolvedValueOnce({ rows: [playerRow] });
    mockDb.query.mockResolvedValueOnce({ rows: [teamRow] });
    mockDb.query.mockResolvedValueOnce({ rows: [junctionRow] });

    const result = await q.findById('game-1');

    expect(result?.teams).toEqual([{ id: 'team-1', name: 'Team A', players: [player] }]);
  });
});

// ---------------------------------------------------------------------------
// selectRoomForUpdate
// ---------------------------------------------------------------------------

describe('GameQuery.selectRoomForUpdate', () => {
  it('returns the row when the room exists', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'room-1' }] });

    const result = await q.selectRoomForUpdate('room-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'SELECT id FROM rooms WHERE id = $1 FOR UPDATE',
      ['room-1']
    );
    expect(result).toEqual({ id: 'room-1' });
  });

  it('returns null when the room does not exist', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    const result = await q.selectRoomForUpdate('room-1');

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// checkRoomHasGame
// ---------------------------------------------------------------------------

describe('GameQuery.checkRoomHasGame', () => {
  it('returns true when a game row exists for the room', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'game-1' }] });

    const result = await q.checkRoomHasGame('room-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'SELECT id FROM games WHERE room_id = $1',
      ['room-1']
    );
    expect(result).toBe(true);
  });

  it('returns false when no game exists for the room', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    const result = await q.checkRoomHasGame('room-1');

    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// selectPlayersByGame
// ---------------------------------------------------------------------------

describe('GameQuery.selectPlayersByGame', () => {
  it('returns mapped Player array ordered by position', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [playerRow] });

    const result = await q.selectPlayersByGame('game-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'SELECT id, game_id, name, priority, notes, position, created_at FROM game_players WHERE game_id = $1 ORDER BY position',
      ['game-1']
    );
    expect(result).toEqual([player]);
  });

  it('returns empty array when no players exist', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    const result = await q.selectPlayersByGame('game-1');

    expect(result).toEqual([]);
  });

  it('maps notes null to undefined', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ ...playerRow, notes: null }] });

    const [p] = await q.selectPlayersByGame('game-1');

    expect(p?.notes).toBeUndefined();
  });

  it('maps notes string value correctly', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ ...playerRow, notes: 'some note' }] });

    const [p] = await q.selectPlayersByGame('game-1');

    expect(p?.notes).toBe('some note');
  });
});

// ---------------------------------------------------------------------------
// maxPlayerPosition
// ---------------------------------------------------------------------------

describe('GameQuery.maxPlayerPosition', () => {
  it('returns the max position when players exist', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ max: 4 }] });

    const result = await q.maxPlayerPosition('game-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'SELECT MAX(position) as max FROM game_players WHERE game_id = $1',
      ['game-1']
    );
    expect(result).toBe(4);
  });

  it('returns -1 when the table is empty (max is null)', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ max: null }] });

    const result = await q.maxPlayerPosition('game-1');

    expect(result).toBe(-1);
  });

  it('returns -1 when no rows are returned', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    const result = await q.maxPlayerPosition('game-1');

    expect(result).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// insertPlayer
// ---------------------------------------------------------------------------

describe('GameQuery.insertPlayer', () => {
  it('executes INSERT and returns a mapped Player', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [playerRow] });

    const result = await q.insertPlayer('player-1', 'game-1', 'Alice', false, null, 0);

    expect(mockDb.query).toHaveBeenCalledWith(
      'INSERT INTO game_players (id, game_id, name, priority, notes, position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, game_id, name, priority, notes, position, created_at',
      ['player-1', 'game-1', 'Alice', false, null, 0]
    );
    expect(result).toEqual(player);
  });
});

// ---------------------------------------------------------------------------
// deletePlayer
// ---------------------------------------------------------------------------

describe('GameQuery.deletePlayer', () => {
  it('returns the deleted row position when found', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ position: 2 }] });

    const result = await q.deletePlayer('player-1', 'game-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'DELETE FROM game_players WHERE id = $1 AND game_id = $2 RETURNING position',
      ['player-1', 'game-1']
    );
    expect(result).toEqual({ position: 2 });
  });

  it('returns null when no matching player exists', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    const result = await q.deletePlayer('player-1', 'game-1');

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// decrementPlayerPositions
// ---------------------------------------------------------------------------

describe('GameQuery.decrementPlayerPositions', () => {
  it('executes UPDATE with correct gameId and afterPosition', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    await q.decrementPlayerPositions('game-1', 2);

    expect(mockDb.query).toHaveBeenCalledWith(
      'UPDATE game_players SET position = position - 1 WHERE game_id = $1 AND position > $2',
      ['game-1', 2]
    );
  });
});

// ---------------------------------------------------------------------------
// updatePlayerPriority
// ---------------------------------------------------------------------------

describe('GameQuery.updatePlayerPriority', () => {
  it('returns mapped Player when the row is found', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ ...playerRow, priority: true }] });

    const result = await q.updatePlayerPriority('game-1', 'player-1', true);

    expect(mockDb.query).toHaveBeenCalledWith(
      'UPDATE game_players SET priority = $1 WHERE id = $2 AND game_id = $3 RETURNING id, game_id, name, priority, notes, position, created_at',
      [true, 'player-1', 'game-1']
    );
    expect(result?.priority).toBe(true);
  });

  it('returns null when no matching player/game pair exists', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    const result = await q.updatePlayerPriority('game-1', 'player-99', true);

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// selectPlayersForReorder
// ---------------------------------------------------------------------------

describe('GameQuery.selectPlayersForReorder', () => {
  it('returns id+position pairs ordered by position', async () => {
    const rows = [
      { id: 'p1', position: 0 },
      { id: 'p2', position: 1 },
    ];
    mockDb.query.mockResolvedValueOnce({ rows });

    const result = await q.selectPlayersForReorder('game-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'SELECT id, position FROM game_players WHERE game_id = $1 ORDER BY position',
      ['game-1']
    );
    expect(result).toEqual(rows);
  });

  it('returns empty array when no players exist', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    const result = await q.selectPlayersForReorder('game-1');

    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// updatePlayerPosition
// ---------------------------------------------------------------------------

describe('GameQuery.updatePlayerPosition', () => {
  it('executes UPDATE with position and playerId', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    await q.updatePlayerPosition('player-1', 3);

    expect(mockDb.query).toHaveBeenCalledWith(
      'UPDATE game_players SET position = $1 WHERE id = $2',
      [3, 'player-1']
    );
  });
});

// ---------------------------------------------------------------------------
// updateTeamCount
// ---------------------------------------------------------------------------

describe('GameQuery.updateTeamCount', () => {
  it('returns updated GameRow when game exists', async () => {
    const updatedRow = { ...gameRow, team_count: 3 };
    mockDb.query.mockResolvedValueOnce({ rows: [updatedRow] });

    const result = await q.updateTeamCount('game-1', 3);

    expect(mockDb.query).toHaveBeenCalledWith(
      'UPDATE games SET team_count = $1 WHERE id = $2 RETURNING id, room_id, team_count, game_status, created_at',
      [3, 'game-1']
    );
    expect(result).toEqual(updatedRow);
  });

  it('returns null when game is not found', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    const result = await q.updateTeamCount('game-99', 3);

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// updateGameStatus
// ---------------------------------------------------------------------------

describe('GameQuery.updateGameStatus', () => {
  it('executes UPDATE with status and gameId', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    await q.updateGameStatus('game-1', 'complete');

    expect(mockDb.query).toHaveBeenCalledWith(
      'UPDATE games SET game_status = $1 WHERE id = $2',
      ['complete', 'game-1']
    );
  });
});

// ---------------------------------------------------------------------------
// deleteTeamsByGame
// ---------------------------------------------------------------------------

describe('GameQuery.deleteTeamsByGame', () => {
  it('executes DELETE for the given gameId', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    await q.deleteTeamsByGame('game-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'DELETE FROM teams WHERE game_id = $1',
      ['game-1']
    );
  });
});

// ---------------------------------------------------------------------------
// insertTeam
// ---------------------------------------------------------------------------

describe('GameQuery.insertTeam', () => {
  it('executes INSERT with all team fields', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    await q.insertTeam('team-1', 'game-1', 'Team A', 1);

    expect(mockDb.query).toHaveBeenCalledWith(
      'INSERT INTO teams (id, game_id, name, position) VALUES ($1, $2, $3, $4)',
      ['team-1', 'game-1', 'Team A', 1]
    );
  });
});

// ---------------------------------------------------------------------------
// insertTeamPlayer
// ---------------------------------------------------------------------------

describe('GameQuery.insertTeamPlayer', () => {
  it('executes INSERT into team_players junction table', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    await q.insertTeamPlayer('team-1', 'player-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'INSERT INTO team_players (team_id, game_player_id) VALUES ($1, $2)',
      ['team-1', 'player-1']
    );
  });
});

// ---------------------------------------------------------------------------
// selectTeamsWithPlayers
// ---------------------------------------------------------------------------

describe('GameQuery.selectTeamsWithPlayers', () => {
  it('returns empty array when no teams exist', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    const result = await q.selectTeamsWithPlayers('game-1', [player]);

    expect(mockDb.query).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
  });

  it('queries teams then junction and assembles Team[] correctly', async () => {
    const junctionRow = { team_id: 'team-1', game_player_id: 'player-1' };

    mockDb.query
      .mockResolvedValueOnce({ rows: [teamRow] })
      .mockResolvedValueOnce({ rows: [junctionRow] });

    const result = await q.selectTeamsWithPlayers('game-1', [player]);

    expect(mockDb.query).toHaveBeenCalledTimes(2);
    expect(mockDb.query).toHaveBeenNthCalledWith(
      1,
      'SELECT id, game_id, name, position FROM teams WHERE game_id = $1 ORDER BY position',
      ['game-1']
    );
    expect(mockDb.query).toHaveBeenNthCalledWith(
      2,
      `SELECT tp.team_id, tp.game_player_id FROM team_players tp\n       JOIN teams t ON t.id = tp.team_id WHERE t.game_id = $1`,
      ['game-1']
    );
    expect(result).toEqual([{ id: 'team-1', name: 'Team A', players: [player] }]);
  });

  it('maps junction rows only to their respective team', async () => {
    const teamRow2 = { id: 'team-2', game_id: 'game-1', name: 'Team B', position: 2 };
    const playerRow2 = {
      id: 'player-2',
      game_id: 'game-1',
      name: 'Bob',
      priority: true,
      notes: null,
      position: 1,
      created_at: new Date('2024-01-01'),
    };
    const player2 = {
      id: 'player-2',
      name: 'Bob',
      priority: true,
      notes: undefined,
      timestamp: playerRow2.created_at,
    };
    const junctionRows = [
      { team_id: 'team-1', game_player_id: 'player-1' },
      { team_id: 'team-2', game_player_id: 'player-2' },
    ];

    mockDb.query
      .mockResolvedValueOnce({ rows: [teamRow, teamRow2] })
      .mockResolvedValueOnce({ rows: junctionRows });

    const result = await q.selectTeamsWithPlayers('game-1', [player, player2]);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 'team-1', name: 'Team A', players: [player] });
    expect(result[1]).toEqual({ id: 'team-2', name: 'Team B', players: [player2] });
  });

  it('skips junction rows whose player id is not in the players map', async () => {
    const junctionRow = { team_id: 'team-1', game_player_id: 'unknown-player' };

    mockDb.query
      .mockResolvedValueOnce({ rows: [teamRow] })
      .mockResolvedValueOnce({ rows: [junctionRow] });

    const result = await q.selectTeamsWithPlayers('game-1', [player]);

    expect(result[0]?.players).toEqual([]);
  });
});
