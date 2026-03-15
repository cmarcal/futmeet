import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameRepository } from '@modules/game/repository/index.js';

const mockQuery = {
  insertGame: vi.fn(),
  findById: vi.fn(),
  selectRoomForUpdate: vi.fn(),
  checkRoomHasGame: vi.fn(),
  selectPlayersByGame: vi.fn(),
  maxPlayerPosition: vi.fn(),
  insertPlayer: vi.fn(),
  deletePlayer: vi.fn(),
  decrementPlayerPositions: vi.fn(),
  updatePlayerPriority: vi.fn(),
  selectPlayersForReorder: vi.fn(),
  updatePlayerPosition: vi.fn(),
  updateTeamCount: vi.fn(),
  updateGameStatus: vi.fn(),
  deleteTeamsByGame: vi.fn(),
  insertTeam: vi.fn(),
  insertTeamPlayer: vi.fn(),
  selectTeamsWithPlayers: vi.fn(),
};

const mockClient = { query: vi.fn(), release: vi.fn() };
const mockDb = { connect: vi.fn().mockResolvedValue(mockClient) };
const repo = new GameRepository(mockDb as any, () => mockQuery as any);

beforeEach(() => {
  vi.clearAllMocks();
  mockDb.connect.mockResolvedValue(mockClient);
  mockClient.query.mockResolvedValue(undefined);
  mockClient.release.mockReturnValue(undefined);
});

describe('GameRepository.create', () => {
  it('calls insertGame with a generated id and null roomId, returns Game with empty players/teams', async () => {
    const now = new Date();
    mockQuery.insertGame.mockResolvedValue({
      id: 'game-1',
      room_id: null,
      team_count: 2,
      game_status: 'setup',
      created_at: now,
    });

    const result = await repo.create();

    expect(mockQuery.insertGame).toHaveBeenCalledOnce();
    const [calledId, calledRoomId] = mockQuery.insertGame.mock.calls[0]!;
    expect(typeof calledId).toBe('string');
    expect(calledRoomId).toBeNull();

    expect(result).toEqual({
      id: 'game-1',
      roomId: null,
      players: [],
      teamCount: 2,
      gameStatus: 'setup',
      teams: [],
      createdAt: now,
    });
  });

  it('passes roomId to insertGame when provided', async () => {
    const now = new Date();
    mockQuery.insertGame.mockResolvedValue({
      id: 'game-2',
      room_id: 'room-abc',
      team_count: 2,
      game_status: 'setup',
      created_at: now,
    });

    const result = await repo.create('room-abc');

    expect(mockQuery.insertGame).toHaveBeenCalledWith(expect.any(String), 'room-abc');
    expect(result.roomId).toBe('room-abc');
    expect(result.players).toEqual([]);
    expect(result.teams).toEqual([]);
  });
});

describe('GameRepository.findById', () => {
  it('delegates to queryFactory(db).findById and returns the result', async () => {
    const now = new Date();
    const mockGame = {
      id: 'game-1',
      roomId: null,
      players: [],
      teamCount: 2,
      gameStatus: 'setup' as const,
      teams: [],
      createdAt: now,
    };
    mockQuery.findById.mockResolvedValue(mockGame);

    const result = await repo.findById('game-1');

    expect(mockQuery.findById).toHaveBeenCalledWith('game-1');
    expect(result).toBe(mockGame);
  });

  it('returns null when the game does not exist', async () => {
    mockQuery.findById.mockResolvedValue(null);

    const result = await repo.findById('no-such-game');

    expect(result).toBeNull();
  });
});

describe('GameRepository.createFromRoom', () => {
  const players = [
    { id: 'p1', name: 'Alice', priority: false, timestamp: new Date() },
    { id: 'p2', name: 'Bob', priority: true, notes: 'captain', timestamp: new Date() },
  ];

  it('success: locks room, inserts game, inserts one player per input player, returns { ok: true, data: game }', async () => {
    const now = new Date();
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-1' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.insertGame.mockResolvedValue({
      id: 'game-1',
      room_id: 'room-1',
      team_count: 2,
      game_status: 'setup',
      created_at: now,
    });
    mockQuery.insertPlayer.mockResolvedValue({});

    const result = await repo.createFromRoom('room-1', players);

    expect(mockQuery.selectRoomForUpdate).toHaveBeenCalledWith('room-1');
    expect(mockQuery.checkRoomHasGame).toHaveBeenCalledWith('room-1');
    expect(mockQuery.insertGame).toHaveBeenCalledWith(expect.any(String), 'room-1');
    expect(mockQuery.insertPlayer).toHaveBeenCalledTimes(2);

    expect(mockQuery.insertPlayer).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.any(String),
      'Alice',
      false,
      null,
      0
    );
    expect(mockQuery.insertPlayer).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.any(String),
      'Bob',
      true,
      'captain',
      1
    );

    expect(result).toEqual({
      ok: true,
      data: {
        id: 'game-1',
        roomId: 'room-1',
        players,
        teamCount: 2,
        gameStatus: 'setup',
        teams: [],
        createdAt: now,
      },
    });
  });

  it('returns { ok: false, reason: "room_not_found" } when selectRoomForUpdate returns null', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue(null);

    const result = await repo.createFromRoom('room-missing', players);

    expect(result).toEqual({ ok: false, reason: 'room_not_found' });
    expect(mockQuery.insertGame).not.toHaveBeenCalled();
  });

  it('returns { ok: false, reason: "room_already_started" } when checkRoomHasGame returns true', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-1' });
    mockQuery.checkRoomHasGame.mockResolvedValue(true);

    const result = await repo.createFromRoom('room-1', players);

    expect(result).toEqual({ ok: false, reason: 'room_already_started' });
    expect(mockQuery.insertGame).not.toHaveBeenCalled();
  });
});

describe('GameRepository.addPlayer', () => {
  it('gets max position, inserts player at position+1, returns the inserted player', async () => {
    const now = new Date();
    const insertedPlayer = {
      id: 'player-new',
      name: 'Charlie',
      priority: false,
      notes: undefined,
      timestamp: now,
    };
    mockQuery.maxPlayerPosition.mockResolvedValue(2);
    mockQuery.insertPlayer.mockResolvedValue(insertedPlayer);

    const result = await repo.addPlayer('game-1', 'Charlie');

    expect(mockQuery.maxPlayerPosition).toHaveBeenCalledWith('game-1');
    expect(mockQuery.insertPlayer).toHaveBeenCalledWith(
      expect.any(String),
      'game-1',
      'Charlie',
      false,
      null,
      3
    );
    expect(result).toBe(insertedPlayer);
  });

  it('passes notes to insertPlayer when provided', async () => {
    const now = new Date();
    mockQuery.maxPlayerPosition.mockResolvedValue(-1);
    mockQuery.insertPlayer.mockResolvedValue({
      id: 'player-new',
      name: 'Dana',
      priority: false,
      notes: 'some notes',
      timestamp: now,
    });

    await repo.addPlayer('game-1', 'Dana', 'some notes');

    expect(mockQuery.insertPlayer).toHaveBeenCalledWith(
      expect.any(String),
      'game-1',
      'Dana',
      false,
      'some notes',
      0
    );
  });
});

describe('GameRepository.removePlayer', () => {
  it('success: deletes player, decrements positions, returns true', async () => {
    mockQuery.deletePlayer.mockResolvedValue({ position: 1 });
    mockQuery.decrementPlayerPositions.mockResolvedValue(undefined);

    const result = await repo.removePlayer('game-1', 'player-1');

    expect(mockQuery.deletePlayer).toHaveBeenCalledWith('player-1', 'game-1');
    expect(mockQuery.decrementPlayerPositions).toHaveBeenCalledWith('game-1', 1);
    expect(result).toBe(true);
  });

  it('returns false when deletePlayer returns null (player not found)', async () => {
    mockQuery.deletePlayer.mockResolvedValue(null);

    const result = await repo.removePlayer('game-1', 'nonexistent-player');

    expect(result).toBe(false);
    expect(mockQuery.decrementPlayerPositions).not.toHaveBeenCalled();
  });
});

describe('GameRepository.setPriority', () => {
  it('delegates to queryFactory(db).updatePlayerPriority and returns the result', async () => {
    const now = new Date();
    const updatedPlayer = {
      id: 'player-1',
      name: 'Alice',
      priority: true,
      notes: undefined,
      timestamp: now,
    };
    mockQuery.updatePlayerPriority.mockResolvedValue(updatedPlayer);

    const result = await repo.setPriority('game-1', 'player-1', true);

    expect(mockQuery.updatePlayerPriority).toHaveBeenCalledWith('game-1', 'player-1', true);
    expect(result).toBe(updatedPlayer);
  });

  it('returns null when updatePlayerPriority returns null', async () => {
    mockQuery.updatePlayerPriority.mockResolvedValue(null);

    const result = await repo.setPriority('game-1', 'missing-player', false);

    expect(result).toBeNull();
  });
});

describe('GameRepository.reorder', () => {
  it('success: splices rows, updates positions for each, returns true', async () => {
    mockQuery.selectPlayersForReorder.mockResolvedValue([
      { id: 'p1', position: 0 },
      { id: 'p2', position: 1 },
      { id: 'p3', position: 2 },
    ]);
    mockQuery.updatePlayerPosition.mockResolvedValue(undefined);

    const result = await repo.reorder('game-1', 0, 2);

    expect(result).toBe(true);
    expect(mockQuery.updatePlayerPosition).toHaveBeenCalledTimes(3);
    expect(mockQuery.updatePlayerPosition).toHaveBeenNthCalledWith(1, 'p2', 0);
    expect(mockQuery.updatePlayerPosition).toHaveBeenNthCalledWith(2, 'p3', 1);
    expect(mockQuery.updatePlayerPosition).toHaveBeenNthCalledWith(3, 'p1', 2);
  });

  it('returns false when fromIndex is out of bounds', async () => {
    mockQuery.selectPlayersForReorder.mockResolvedValue([
      { id: 'p1', position: 0 },
      { id: 'p2', position: 1 },
    ]);

    const result = await repo.reorder('game-1', 5, 0);

    expect(result).toBe(false);
    expect(mockQuery.updatePlayerPosition).not.toHaveBeenCalled();
  });

  it('returns false when toIndex is out of bounds', async () => {
    mockQuery.selectPlayersForReorder.mockResolvedValue([
      { id: 'p1', position: 0 },
      { id: 'p2', position: 1 },
    ]);

    const result = await repo.reorder('game-1', 0, 99);

    expect(result).toBe(false);
    expect(mockQuery.updatePlayerPosition).not.toHaveBeenCalled();
  });

  it('returns false when fromIndex is negative', async () => {
    mockQuery.selectPlayersForReorder.mockResolvedValue([{ id: 'p1', position: 0 }]);

    const result = await repo.reorder('game-1', -1, 0);

    expect(result).toBe(false);
  });
});

describe('GameRepository.setTeamCount', () => {
  it('success: updates team count, fetches players and teams, returns assembled Game', async () => {
    const now = new Date();
    const gameRow = {
      id: 'game-1',
      room_id: 'room-1',
      team_count: 3,
      game_status: 'setup' as const,
      created_at: now,
    };
    const players = [{ id: 'p1', name: 'Alice', priority: false, timestamp: now }];
    const teams = [{ id: 't1', name: 'Team A', players }];

    mockQuery.updateTeamCount.mockResolvedValue(gameRow);
    mockQuery.selectPlayersByGame.mockResolvedValue(players);
    mockQuery.selectTeamsWithPlayers.mockResolvedValue(teams);

    const result = await repo.setTeamCount('game-1', 3);

    expect(mockQuery.updateTeamCount).toHaveBeenCalledWith('game-1', 3);
    expect(mockQuery.selectPlayersByGame).toHaveBeenCalledWith('game-1');
    expect(mockQuery.selectTeamsWithPlayers).toHaveBeenCalledWith('game-1', players);
    expect(result).toEqual({
      id: 'game-1',
      roomId: 'room-1',
      players,
      teamCount: 3,
      gameStatus: 'setup',
      teams,
      createdAt: now,
    });
  });

  it('returns null when updateTeamCount returns null (game not found)', async () => {
    mockQuery.updateTeamCount.mockResolvedValue(null);

    const result = await repo.setTeamCount('no-such-game', 2);

    expect(result).toBeNull();
    expect(mockQuery.selectPlayersByGame).not.toHaveBeenCalled();
  });
});

describe('GameRepository.sort', () => {
  it('success: calls findById, applies sortTeams, writes inside transaction, returns game with gameStatus "complete"', async () => {
    const now = new Date();
    const player1 = { id: 'p1', name: 'Alice', priority: false, timestamp: now };
    const player2 = { id: 'p2', name: 'Bob', priority: false, timestamp: now };
    const existingGame = {
      id: 'game-1',
      roomId: null,
      players: [player1, player2],
      teamCount: 2,
      gameStatus: 'setup' as const,
      teams: [],
      createdAt: now,
    };

    mockQuery.findById.mockResolvedValue(existingGame);
    mockQuery.deleteTeamsByGame.mockResolvedValue(undefined);
    mockQuery.insertTeam.mockResolvedValue(undefined);
    mockQuery.insertTeamPlayer.mockResolvedValue(undefined);
    mockQuery.updateGameStatus.mockResolvedValue(undefined);

    const result = await repo.sort('game-1');

    expect(mockQuery.findById).toHaveBeenCalledWith('game-1');
    expect(mockQuery.deleteTeamsByGame).toHaveBeenCalledWith('game-1');
    expect(mockQuery.updateGameStatus).toHaveBeenCalledWith('game-1', 'complete');

    expect(result).not.toBeNull();
    expect(result!.gameStatus).toBe('complete');
    expect(result!.id).toBe('game-1');
    expect(Array.isArray(result!.teams)).toBe(true);
    const allTeamPlayers = result!.teams.flatMap((t) => t.players);
    expect(allTeamPlayers.length).toBe(2);
  });

  it('returns null when findById returns null', async () => {
    mockQuery.findById.mockResolvedValue(null);

    const result = await repo.sort('no-such-game');

    expect(result).toBeNull();
    expect(mockQuery.deleteTeamsByGame).not.toHaveBeenCalled();
  });

  it('issues insertTeam and insertTeamPlayer for each sorted team and player', async () => {
    const now = new Date();
    const player1 = { id: 'p1', name: 'Alice', priority: true, timestamp: now };
    const player2 = { id: 'p2', name: 'Bob', priority: false, timestamp: now };
    const player3 = { id: 'p3', name: 'Carol', priority: false, timestamp: now };
    const existingGame = {
      id: 'game-2',
      roomId: null,
      players: [player1, player2, player3],
      teamCount: 2,
      gameStatus: 'setup' as const,
      teams: [],
      createdAt: now,
    };

    mockQuery.findById.mockResolvedValue(existingGame);
    mockQuery.deleteTeamsByGame.mockResolvedValue(undefined);
    mockQuery.insertTeam.mockResolvedValue(undefined);
    mockQuery.insertTeamPlayer.mockResolvedValue(undefined);
    mockQuery.updateGameStatus.mockResolvedValue(undefined);

    const result = await repo.sort('game-2');

    expect(result!.gameStatus).toBe('complete');
    expect(result!.teams.length).toBe(2);
    expect(mockQuery.insertTeam).toHaveBeenCalledTimes(2);
    const totalPlayers = result!.teams.reduce((sum, t) => sum + t.players.length, 0);
    expect(mockQuery.insertTeamPlayer).toHaveBeenCalledTimes(totalPlayers);
  });
});
