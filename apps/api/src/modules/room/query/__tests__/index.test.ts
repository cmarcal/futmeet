import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoomQuery } from '@modules/room/query/index.js';

const mockDb = { query: vi.fn() };
const q = new RoomQuery(mockDb as any);

beforeEach(() => {
  vi.clearAllMocks();
});

const roomRow = { id: 'room-1', created_at: new Date('2024-01-01T00:00:00Z') };

const playerRow = {
  id: 'player-1',
  room_id: 'room-1',
  name: 'Alice',
  priority: false,
  notes: 'some notes',
  position: 0,
  created_at: new Date('2024-01-01T00:00:00Z'),
};

const expectedPlayer = {
  id: 'player-1',
  name: 'Alice',
  priority: false,
  notes: 'some notes',
  timestamp: playerRow.created_at,
};

const expectedRoom = {
  id: 'room-1',
  players: [],
  createdAt: roomRow.created_at,
};

describe('RoomQuery.insertRoom', () => {
  it('executes INSERT and returns a Room with empty players array', async () => {
    mockDb.query.mockResolvedValue({ rows: [roomRow] });

    const result = await q.insertRoom('room-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'INSERT INTO rooms (id) VALUES ($1) RETURNING id, created_at',
      ['room-1']
    );
    expect(result).toEqual(expectedRoom);
  });
});

describe('RoomQuery.findById', () => {
  it('returns assembled Room when room exists', async () => {
    mockDb.query
      .mockResolvedValueOnce({ rows: [roomRow] })
      .mockResolvedValueOnce({ rows: [playerRow] });

    const result = await q.findById('room-1');

    expect(mockDb.query).toHaveBeenNthCalledWith(
      1,
      'SELECT id, created_at FROM rooms WHERE id = $1',
      ['room-1']
    );
    expect(mockDb.query).toHaveBeenNthCalledWith(
      2,
      'SELECT id, room_id, name, priority, notes, position, created_at FROM room_players WHERE room_id = $1 ORDER BY position',
      ['room-1']
    );
    expect(result).toEqual({ ...expectedRoom, players: [expectedPlayer] });
  });

  it('returns null when room does not exist', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    const result = await q.findById('missing-room');

    expect(mockDb.query).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });
});

describe('RoomQuery.selectRoomForUpdate', () => {
  it('returns { id } when room exists', async () => {
    mockDb.query.mockResolvedValue({ rows: [{ id: 'room-1' }] });

    const result = await q.selectRoomForUpdate('room-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'SELECT id FROM rooms WHERE id = $1 FOR UPDATE',
      ['room-1']
    );
    expect(result).toEqual({ id: 'room-1' });
  });

  it('returns null when room does not exist', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });

    const result = await q.selectRoomForUpdate('missing-room');

    expect(result).toBeNull();
  });
});

describe('RoomQuery.checkRoomHasGame', () => {
  it('returns true when count > 0', async () => {
    mockDb.query.mockResolvedValue({ rows: [{ count: '1' }] });

    const result = await q.checkRoomHasGame('room-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'SELECT COUNT(*) as count FROM games WHERE room_id = $1',
      ['room-1']
    );
    expect(result).toBe(true);
  });

  it('returns false when count is 0', async () => {
    mockDb.query.mockResolvedValue({ rows: [{ count: '0' }] });

    const result = await q.checkRoomHasGame('room-1');

    expect(result).toBe(false);
  });
});

describe('RoomQuery.selectPlayersByRoom', () => {
  it('returns mapped Player array ordered by position', async () => {
    mockDb.query.mockResolvedValue({ rows: [playerRow] });

    const result = await q.selectPlayersByRoom('room-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'SELECT id, room_id, name, priority, notes, position, created_at FROM room_players WHERE room_id = $1 ORDER BY position',
      ['room-1']
    );
    expect(result).toEqual([expectedPlayer]);
  });

  it('maps notes: null to undefined on the Player', async () => {
    const rowWithoutNotes = { ...playerRow, notes: null };
    mockDb.query.mockResolvedValue({ rows: [rowWithoutNotes] });

    const result = await q.selectPlayersByRoom('room-1');

    expect(result[0]!.notes).toBeUndefined();
  });
});

describe('RoomQuery.maxPlayerPosition', () => {
  it('returns the max position when players exist', async () => {
    mockDb.query.mockResolvedValue({ rows: [{ max: 3 }] });

    const result = await q.maxPlayerPosition('room-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'SELECT MAX(position) as max FROM room_players WHERE room_id = $1',
      ['room-1']
    );
    expect(result).toBe(3);
  });

  it('returns -1 when there are no players (max is null)', async () => {
    mockDb.query.mockResolvedValue({ rows: [{ max: null }] });

    const result = await q.maxPlayerPosition('room-1');

    expect(result).toBe(-1);
  });
});

describe('RoomQuery.insertPlayer', () => {
  it('executes INSERT and returns mapped Player', async () => {
    mockDb.query.mockResolvedValue({ rows: [playerRow] });

    const result = await q.insertPlayer('player-1', 'room-1', 'Alice', 'some notes', 0);

    expect(mockDb.query).toHaveBeenCalledWith(
      `INSERT INTO room_players (id, room_id, name, notes, position)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, room_id, name, priority, notes, position, created_at`,
      ['player-1', 'room-1', 'Alice', 'some notes', 0]
    );
    expect(result).toEqual(expectedPlayer);
  });
});

describe('RoomQuery.deletePlayer', () => {
  it('returns { position } when the player was deleted', async () => {
    mockDb.query.mockResolvedValue({ rows: [{ position: 2 }] });

    const result = await q.deletePlayer('player-1', 'room-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'DELETE FROM room_players WHERE id = $1 AND room_id = $2 RETURNING position',
      ['player-1', 'room-1']
    );
    expect(result).toEqual({ position: 2 });
  });

  it('returns null when the player was not found', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });

    const result = await q.deletePlayer('ghost-player', 'room-1');

    expect(result).toBeNull();
  });
});

describe('RoomQuery.decrementPlayerPositions', () => {
  it('executes UPDATE to decrement positions after the given position', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });

    await q.decrementPlayerPositions('room-1', 2);

    expect(mockDb.query).toHaveBeenCalledWith(
      'UPDATE room_players SET position = position - 1 WHERE room_id = $1 AND position > $2',
      ['room-1', 2]
    );
  });
});

describe('RoomQuery.updatePlayerPriority', () => {
  it('returns mapped Player when the player was updated', async () => {
    const updatedRow = { ...playerRow, priority: true };
    const updatedPlayer = { ...expectedPlayer, priority: true };
    mockDb.query.mockResolvedValue({ rows: [updatedRow] });

    const result = await q.updatePlayerPriority('room-1', 'player-1', true);

    expect(mockDb.query).toHaveBeenCalledWith(
      `UPDATE room_players SET priority = $1
       WHERE id = $2 AND room_id = $3
       RETURNING id, room_id, name, priority, notes, position, created_at`,
      [true, 'player-1', 'room-1']
    );
    expect(result).toEqual(updatedPlayer);
  });

  it('returns null when the player was not found', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });

    const result = await q.updatePlayerPriority('room-1', 'ghost-player', true);

    expect(result).toBeNull();
  });
});

describe('RoomQuery.selectPlayersForReorder', () => {
  it('returns id and position pairs ordered by position', async () => {
    const rows = [
      { id: 'player-1', position: 0 },
      { id: 'player-2', position: 1 },
    ];
    mockDb.query.mockResolvedValue({ rows });

    const result = await q.selectPlayersForReorder('room-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'SELECT id, position FROM room_players WHERE room_id = $1 ORDER BY position',
      ['room-1']
    );
    expect(result).toEqual(rows);
  });
});

describe('RoomQuery.updatePlayerPosition', () => {
  it('executes UPDATE with new position for the given player', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });

    await q.updatePlayerPosition('player-1', 3);

    expect(mockDb.query).toHaveBeenCalledWith(
      'UPDATE room_players SET position = $1 WHERE id = $2',
      [3, 'player-1']
    );
  });
});

describe('RoomQuery.deleteAllPlayers', () => {
  it('executes DELETE for all players in the given room', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });

    await q.deleteAllPlayers('room-1');

    expect(mockDb.query).toHaveBeenCalledWith(
      'DELETE FROM room_players WHERE room_id = $1',
      ['room-1']
    );
  });
});
