import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoomRepository } from '@modules/room/repository/index.js';

const mockQuery = {
  insertRoom: vi.fn(),
  findById: vi.fn(),
  checkRoomHasGame: vi.fn(),
  selectRoomForUpdate: vi.fn(),
  maxPlayerPosition: vi.fn(),
  insertPlayer: vi.fn(),
  deletePlayer: vi.fn(),
  decrementPlayerPositions: vi.fn(),
  updatePlayerPriority: vi.fn(),
  selectPlayersForReorder: vi.fn(),
  updatePlayerPosition: vi.fn(),
  deleteAllPlayers: vi.fn(),
};

const mockClient = { query: vi.fn(), release: vi.fn() };
const mockDb = { connect: vi.fn().mockResolvedValue(mockClient) };
const repo = new RoomRepository(mockDb as any, () => mockQuery as any);

const mockRoom = { id: 'room-abc', players: [], createdAt: new Date() };
const mockPlayer = {
  id: 'player-1',
  name: 'Alice',
  priority: false,
  notes: undefined,
  timestamp: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockDb.connect.mockResolvedValue(mockClient);
  mockClient.query.mockResolvedValue({});
  mockClient.release.mockReturnValue(undefined);
});

describe('RoomRepository.create', () => {
  it('calls insertRoom with a generated id and returns the room', async () => {
    mockQuery.insertRoom.mockResolvedValue(mockRoom);

    const result = await repo.create();

    expect(mockQuery.insertRoom).toHaveBeenCalledTimes(1);
    const [calledId] = mockQuery.insertRoom.mock.calls[0]!;
    expect(typeof calledId).toBe('string');
    expect(calledId.length).toBeGreaterThan(0);
    expect(result).toBe(mockRoom);
  });
});

describe('RoomRepository.findById', () => {
  it('delegates to queryFactory(db).findById(roomId)', async () => {
    mockQuery.findById.mockResolvedValue(mockRoom);

    const result = await repo.findById('room-abc');

    expect(mockQuery.findById).toHaveBeenCalledWith('room-abc');
    expect(result).toBe(mockRoom);
  });

  it('returns null when room does not exist', async () => {
    mockQuery.findById.mockResolvedValue(null);

    const result = await repo.findById('missing-room');

    expect(result).toBeNull();
  });
});

describe('RoomRepository.hasGame', () => {
  it('delegates to queryFactory(db).checkRoomHasGame(roomId)', async () => {
    mockQuery.checkRoomHasGame.mockResolvedValue(true);

    const result = await repo.hasGame('room-abc');

    expect(mockQuery.checkRoomHasGame).toHaveBeenCalledWith('room-abc');
    expect(result).toBe(true);
  });
});

describe('RoomRepository.addPlayer', () => {
  it('returns { ok: true, data: player } on success', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.maxPlayerPosition.mockResolvedValue(0);
    mockQuery.insertPlayer.mockResolvedValue(mockPlayer);

    const result = await repo.addPlayer('room-abc', 'Alice', 'some notes');

    expect(mockQuery.selectRoomForUpdate).toHaveBeenCalledWith('room-abc');
    expect(mockQuery.maxPlayerPosition).toHaveBeenCalledWith('room-abc');
    expect(mockQuery.insertPlayer).toHaveBeenCalledWith(
      expect.any(String),
      'room-abc',
      'Alice',
      'some notes',
      1
    );
    expect(result).toEqual({ ok: true, data: mockPlayer });
  });

  it('uses null for notes when notes arg is omitted', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.maxPlayerPosition.mockResolvedValue(-1);
    mockQuery.insertPlayer.mockResolvedValue(mockPlayer);

    await repo.addPlayer('room-abc', 'Alice');

    expect(mockQuery.insertPlayer).toHaveBeenCalledWith(
      expect.any(String),
      'room-abc',
      'Alice',
      null,
      0
    );
  });

  it('returns { ok: false, reason: "room_not_found" } when selectRoomForUpdate returns null', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue(null);

    const result = await repo.addPlayer('missing-room', 'Alice');

    expect(result).toEqual({ ok: false, reason: 'room_not_found' });
    expect(mockQuery.insertPlayer).not.toHaveBeenCalled();
  });

  it('returns { ok: false, reason: "room_already_started" } when checkRoomHasGame returns true', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(true);

    const result = await repo.addPlayer('room-abc', 'Alice');

    expect(result).toEqual({ ok: false, reason: 'room_already_started' });
    expect(mockQuery.insertPlayer).not.toHaveBeenCalled();
  });

  it('calls BEGIN and COMMIT on success', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.maxPlayerPosition.mockResolvedValue(-1);
    mockQuery.insertPlayer.mockResolvedValue(mockPlayer);

    await repo.addPlayer('room-abc', 'Alice');

    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('calls ROLLBACK when an unexpected error is thrown', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.maxPlayerPosition.mockRejectedValue(new Error('db error'));

    await expect(repo.addPlayer('room-abc', 'Alice')).rejects.toThrow('db error');

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalled();
  });
});

describe('RoomRepository.removePlayer', () => {
  it('returns { ok: true, data: undefined } on success', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.deletePlayer.mockResolvedValue({ position: 2 });
    mockQuery.decrementPlayerPositions.mockResolvedValue(undefined);

    const result = await repo.removePlayer('room-abc', 'player-1');

    expect(mockQuery.deletePlayer).toHaveBeenCalledWith('player-1', 'room-abc');
    expect(mockQuery.decrementPlayerPositions).toHaveBeenCalledWith('room-abc', 2);
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it('returns { ok: false, reason: "player_not_found" } when deletePlayer returns null', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.deletePlayer.mockResolvedValue(null);

    const result = await repo.removePlayer('room-abc', 'ghost-player');

    expect(result).toEqual({ ok: false, reason: 'player_not_found' });
    expect(mockQuery.decrementPlayerPositions).not.toHaveBeenCalled();
  });

  it('returns { ok: false, reason: "room_not_found" } when lock fails', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue(null);

    const result = await repo.removePlayer('missing-room', 'player-1');

    expect(result).toEqual({ ok: false, reason: 'room_not_found' });
  });

  it('calls BEGIN and COMMIT on success', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.deletePlayer.mockResolvedValue({ position: 0 });
    mockQuery.decrementPlayerPositions.mockResolvedValue(undefined);

    await repo.removePlayer('room-abc', 'player-1');

    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
  });

  it('calls ROLLBACK when an unexpected error is thrown', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.deletePlayer.mockRejectedValue(new Error('db error'));

    await expect(repo.removePlayer('room-abc', 'player-1')).rejects.toThrow('db error');

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
  });
});

describe('RoomRepository.setPriority', () => {
  it('returns { ok: true, data: player } on success', async () => {
    const updatedPlayer = { ...mockPlayer, priority: true };
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.updatePlayerPriority.mockResolvedValue(updatedPlayer);

    const result = await repo.setPriority('room-abc', 'player-1', true);

    expect(mockQuery.updatePlayerPriority).toHaveBeenCalledWith('room-abc', 'player-1', true);
    expect(result).toEqual({ ok: true, data: updatedPlayer });
  });

  it('returns { ok: false, reason: "player_not_found" } when updatePlayerPriority returns null', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.updatePlayerPriority.mockResolvedValue(null);

    const result = await repo.setPriority('room-abc', 'ghost-player', true);

    expect(result).toEqual({ ok: false, reason: 'player_not_found' });
  });

  it('returns { ok: false, reason: "room_not_found" } when lock fails', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue(null);

    const result = await repo.setPriority('missing-room', 'player-1', true);

    expect(result).toEqual({ ok: false, reason: 'room_not_found' });
  });

  it('calls BEGIN and COMMIT on success', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.updatePlayerPriority.mockResolvedValue({ ...mockPlayer, priority: true });

    await repo.setPriority('room-abc', 'player-1', true);

    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
  });
});

describe('RoomRepository.reorder', () => {
  it('returns { ok: true, data: undefined } on success and calls updatePlayerPosition for each row', async () => {
    const rows = [
      { id: 'p1', position: 0 },
      { id: 'p2', position: 1 },
      { id: 'p3', position: 2 },
    ];
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.selectPlayersForReorder.mockResolvedValue([...rows]);
    mockQuery.updatePlayerPosition.mockResolvedValue(undefined);

    const result = await repo.reorder('room-abc', 0, 2);

    expect(mockQuery.selectPlayersForReorder).toHaveBeenCalledWith('room-abc');
    expect(mockQuery.updatePlayerPosition).toHaveBeenCalledTimes(3);
    expect(mockQuery.updatePlayerPosition).toHaveBeenNthCalledWith(1, 'p2', 0);
    expect(mockQuery.updatePlayerPosition).toHaveBeenNthCalledWith(2, 'p3', 1);
    expect(mockQuery.updatePlayerPosition).toHaveBeenNthCalledWith(3, 'p1', 2);
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it('returns { ok: false, reason: "invalid_indices" } when fromIndex is out of range', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.selectPlayersForReorder.mockResolvedValue([{ id: 'p1', position: 0 }]);

    const result = await repo.reorder('room-abc', 99, 0);

    expect(result).toEqual({ ok: false, reason: 'invalid_indices' });
    expect(mockQuery.updatePlayerPosition).not.toHaveBeenCalled();
  });

  it('returns { ok: false, reason: "invalid_indices" } when toIndex is out of range', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.selectPlayersForReorder.mockResolvedValue([{ id: 'p1', position: 0 }]);

    const result = await repo.reorder('room-abc', 0, 99);

    expect(result).toEqual({ ok: false, reason: 'invalid_indices' });
  });

  it('returns { ok: false, reason: "room_not_found" } when lock fails', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue(null);

    const result = await repo.reorder('missing-room', 0, 1);

    expect(result).toEqual({ ok: false, reason: 'room_not_found' });
  });

  it('calls BEGIN and COMMIT on success', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.selectPlayersForReorder.mockResolvedValue([
      { id: 'p1', position: 0 },
      { id: 'p2', position: 1 },
    ]);
    mockQuery.updatePlayerPosition.mockResolvedValue(undefined);

    await repo.reorder('room-abc', 0, 1);

    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
  });
});

describe('RoomRepository.clearPlayers', () => {
  it('returns { ok: true, data: undefined } on success', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.deleteAllPlayers.mockResolvedValue(undefined);

    const result = await repo.clearPlayers('room-abc');

    expect(mockQuery.deleteAllPlayers).toHaveBeenCalledWith('room-abc');
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it('returns { ok: false, reason: "room_not_found" } when lock fails', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue(null);

    const result = await repo.clearPlayers('missing-room');

    expect(result).toEqual({ ok: false, reason: 'room_not_found' });
    expect(mockQuery.deleteAllPlayers).not.toHaveBeenCalled();
  });

  it('returns { ok: false, reason: "room_already_started" } when game exists', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(true);

    const result = await repo.clearPlayers('room-abc');

    expect(result).toEqual({ ok: false, reason: 'room_already_started' });
    expect(mockQuery.deleteAllPlayers).not.toHaveBeenCalled();
  });

  it('calls BEGIN and COMMIT on success', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.deleteAllPlayers.mockResolvedValue(undefined);

    await repo.clearPlayers('room-abc');

    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('calls ROLLBACK when an unexpected error is thrown', async () => {
    mockQuery.selectRoomForUpdate.mockResolvedValue({ id: 'room-abc' });
    mockQuery.checkRoomHasGame.mockResolvedValue(false);
    mockQuery.deleteAllPlayers.mockRejectedValue(new Error('db error'));

    await expect(repo.clearPlayers('room-abc')).rejects.toThrow('db error');

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalled();
  });
});
