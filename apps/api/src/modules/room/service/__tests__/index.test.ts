import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoomService } from '@modules/room/service/index.js';
import {
  RoomNotFound,
  RoomPlayerNotFound,
  RoomAlreadyStarted,
  InvalidReorderIndices,
} from '@modules/room/error/index.js';

const mockRoom = { id: 'room123', players: [], createdAt: new Date() };
const mockPlayer = { id: crypto.randomUUID(), name: 'Alice', priority: false, timestamp: new Date() };

const mockRoomRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  addPlayer: vi.fn(),
  removePlayer: vi.fn(),
  setPriority: vi.fn(),
  reorder: vi.fn(),
  clearPlayers: vi.fn(),
  hasGame: vi.fn(),
};

const mockGameRepo = {
  createFromRoom: vi.fn(),
};

const service = new RoomService(mockRoomRepo as any, mockGameRepo as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RoomService.createRoom', () => {
  it('calls roomRepo.create() and returns its result', async () => {
    mockRoomRepo.create.mockResolvedValue(mockRoom);

    const result = await service.createRoom();

    expect(mockRoomRepo.create).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockRoom);
  });
});

describe('RoomService.getRoom', () => {
  it('returns the room when findById resolves a room', async () => {
    mockRoomRepo.findById.mockResolvedValue(mockRoom);

    const result = await service.getRoom('room123');

    expect(mockRoomRepo.findById).toHaveBeenCalledWith('room123');
    expect(result).toBe(mockRoom);
  });

  it('throws RoomNotFound when findById resolves null', async () => {
    mockRoomRepo.findById.mockResolvedValue(null);

    await expect(service.getRoom('missing-room')).rejects.toBeInstanceOf(RoomNotFound);
  });
});

describe('RoomService.addPlayer', () => {
  it('calls roomRepo.addPlayer with correct args and returns the player on success', async () => {
    mockRoomRepo.addPlayer.mockResolvedValue({ ok: true, data: mockPlayer });

    const result = await service.addPlayer('room123', 'Alice', 'some notes');

    expect(mockRoomRepo.addPlayer).toHaveBeenCalledWith('room123', 'Alice', 'some notes');
    expect(result).toBe(mockPlayer);
  });

  it('throws RoomNotFound when addPlayer returns { ok: false, reason: "room_not_found" }', async () => {
    mockRoomRepo.addPlayer.mockResolvedValue({ ok: false, reason: 'room_not_found' });

    await expect(service.addPlayer('missing-room', 'Alice')).rejects.toBeInstanceOf(RoomNotFound);
  });

  it('throws RoomAlreadyStarted when addPlayer returns { ok: false, reason: "room_already_started" }', async () => {
    mockRoomRepo.addPlayer.mockResolvedValue({ ok: false, reason: 'room_already_started' });

    await expect(service.addPlayer('room123', 'Alice')).rejects.toBeInstanceOf(RoomAlreadyStarted);
  });
});

describe('RoomService.removePlayer', () => {
  it('resolves successfully when removePlayer returns { ok: true }', async () => {
    mockRoomRepo.removePlayer.mockResolvedValue({ ok: true, data: undefined });

    await expect(service.removePlayer('room123', mockPlayer.id)).resolves.toBeUndefined();

    expect(mockRoomRepo.removePlayer).toHaveBeenCalledWith('room123', mockPlayer.id);
  });

  it('throws RoomPlayerNotFound when removePlayer returns { ok: false, reason: "player_not_found" }', async () => {
    mockRoomRepo.removePlayer.mockResolvedValue({ ok: false, reason: 'player_not_found' });

    await expect(service.removePlayer('room123', 'ghost-player')).rejects.toBeInstanceOf(RoomPlayerNotFound);
  });

  it('throws RoomNotFound when removePlayer returns { ok: false, reason: "room_not_found" }', async () => {
    mockRoomRepo.removePlayer.mockResolvedValue({ ok: false, reason: 'room_not_found' });

    await expect(service.removePlayer('missing-room', mockPlayer.id)).rejects.toBeInstanceOf(RoomNotFound);
  });

  it('throws RoomAlreadyStarted when removePlayer returns { ok: false, reason: "room_already_started" }', async () => {
    mockRoomRepo.removePlayer.mockResolvedValue({ ok: false, reason: 'room_already_started' });

    await expect(service.removePlayer('room123', mockPlayer.id)).rejects.toBeInstanceOf(RoomAlreadyStarted);
  });
});

describe('RoomService.togglePriority', () => {
  it('calls setPriority with toggled value (false→true) and returns the updated player', async () => {
    const playerWithPriorityFalse = { ...mockPlayer, priority: false };
    const roomWithPlayer = { ...mockRoom, players: [playerWithPriorityFalse] };
    const updatedPlayer = { ...playerWithPriorityFalse, priority: true };

    mockRoomRepo.findById.mockResolvedValue(roomWithPlayer);
    mockRoomRepo.setPriority.mockResolvedValue({ ok: true, data: updatedPlayer });

    const result = await service.togglePriority('room123', playerWithPriorityFalse.id);

    expect(mockRoomRepo.findById).toHaveBeenCalledTimes(1);
    expect(mockRoomRepo.findById).toHaveBeenCalledWith('room123');
    expect(mockRoomRepo.setPriority).toHaveBeenCalledWith('room123', playerWithPriorityFalse.id, true);
    expect(result).toBe(updatedPlayer);
  });

  it('calls setPriority with toggled value (true→false)', async () => {
    const playerWithPriorityTrue = { ...mockPlayer, priority: true };
    const roomWithPlayer = { ...mockRoom, players: [playerWithPriorityTrue] };
    const updatedPlayer = { ...playerWithPriorityTrue, priority: false };

    mockRoomRepo.findById.mockResolvedValue(roomWithPlayer);
    mockRoomRepo.setPriority.mockResolvedValue({ ok: true, data: updatedPlayer });

    const result = await service.togglePriority('room123', playerWithPriorityTrue.id);

    expect(mockRoomRepo.setPriority).toHaveBeenCalledWith('room123', playerWithPriorityTrue.id, false);
    expect(result).toBe(updatedPlayer);
  });

  it('throws RoomPlayerNotFound when player is not in room', async () => {
    const emptyRoom = { ...mockRoom, players: [] };
    mockRoomRepo.findById.mockResolvedValue(emptyRoom);

    await expect(service.togglePriority('room123', 'non-existent-player')).rejects.toBeInstanceOf(RoomPlayerNotFound);

    expect(mockRoomRepo.setPriority).not.toHaveBeenCalled();
  });

  it('throws RoomNotFound when findById returns null', async () => {
    mockRoomRepo.findById.mockResolvedValue(null);

    await expect(service.togglePriority('missing-room', mockPlayer.id)).rejects.toBeInstanceOf(RoomNotFound);
  });

  it('throws RoomAlreadyStarted when setPriority returns { ok: false, reason: "room_already_started" }', async () => {
    const roomWithPlayer = { ...mockRoom, players: [mockPlayer] };
    mockRoomRepo.findById.mockResolvedValue(roomWithPlayer);
    mockRoomRepo.setPriority.mockResolvedValue({ ok: false, reason: 'room_already_started' });

    await expect(service.togglePriority('room123', mockPlayer.id)).rejects.toBeInstanceOf(RoomAlreadyStarted);
  });
});

describe('RoomService.reorderPlayers', () => {
  it('calls roomRepo.reorder and returns updated room on success', async () => {
    const reorderedRoom = { ...mockRoom, players: [mockPlayer] };

    mockRoomRepo.reorder.mockResolvedValue({ ok: true, data: undefined });
    mockRoomRepo.findById.mockResolvedValue(reorderedRoom);

    const result = await service.reorderPlayers('room123', 0, 1);

    expect(mockRoomRepo.reorder).toHaveBeenCalledWith('room123', 0, 1);
    expect(mockRoomRepo.findById).toHaveBeenCalledTimes(1);
    expect(mockRoomRepo.findById).toHaveBeenCalledWith('room123');
    expect(result).toBe(reorderedRoom);
  });

  it('throws InvalidReorderIndices when reorder returns { ok: false, reason: "invalid_indices" }', async () => {
    mockRoomRepo.reorder.mockResolvedValue({ ok: false, reason: 'invalid_indices' });

    await expect(service.reorderPlayers('room123', 99, 100)).rejects.toBeInstanceOf(InvalidReorderIndices);

    expect(mockRoomRepo.findById).not.toHaveBeenCalled();
  });

  it('throws RoomNotFound when reorder returns { ok: false, reason: "room_not_found" }', async () => {
    mockRoomRepo.reorder.mockResolvedValue({ ok: false, reason: 'room_not_found' });

    await expect(service.reorderPlayers('missing-room', 0, 1)).rejects.toBeInstanceOf(RoomNotFound);
  });

  it('throws RoomAlreadyStarted when reorder returns { ok: false, reason: "room_already_started" }', async () => {
    mockRoomRepo.reorder.mockResolvedValue({ ok: false, reason: 'room_already_started' });

    await expect(service.reorderPlayers('room123', 0, 1)).rejects.toBeInstanceOf(RoomAlreadyStarted);
  });
});

describe('RoomService.clearPlayers', () => {
  it('resolves successfully when clearPlayers returns { ok: true }', async () => {
    mockRoomRepo.clearPlayers.mockResolvedValue({ ok: true, data: undefined });

    await service.clearPlayers('room123');

    expect(mockRoomRepo.clearPlayers).toHaveBeenCalledWith('room123');
  });

  it('throws RoomNotFound when clearPlayers returns { ok: false, reason: "room_not_found" }', async () => {
    mockRoomRepo.clearPlayers.mockResolvedValue({ ok: false, reason: 'room_not_found' });

    await expect(service.clearPlayers('missing-room')).rejects.toBeInstanceOf(RoomNotFound);
  });

  it('throws RoomAlreadyStarted when clearPlayers returns { ok: false, reason: "room_already_started" }', async () => {
    mockRoomRepo.clearPlayers.mockResolvedValue({ ok: false, reason: 'room_already_started' });

    await expect(service.clearPlayers('room123')).rejects.toBeInstanceOf(RoomAlreadyStarted);
  });
});

describe('RoomService.startGame', () => {
  it('calls gameRepo.createFromRoom with roomId and players, and returns the game', async () => {
    const roomWithPlayers = { ...mockRoom, players: [mockPlayer] };
    const mockGame = { id: 'game-001', roomId: 'room123', players: [mockPlayer] };

    mockRoomRepo.findById.mockResolvedValue(roomWithPlayers);
    mockGameRepo.createFromRoom.mockResolvedValue({ ok: true, data: mockGame });

    const result = await service.startGame('room123');

    expect(mockRoomRepo.findById).toHaveBeenCalledWith('room123');
    expect(mockGameRepo.createFromRoom).toHaveBeenCalledWith('room123', roomWithPlayers.players);
    expect(result).toBe(mockGame);
  });

  it('throws RoomNotFound when findById returns null', async () => {
    mockRoomRepo.findById.mockResolvedValue(null);

    await expect(service.startGame('missing-room')).rejects.toBeInstanceOf(RoomNotFound);

    expect(mockGameRepo.createFromRoom).not.toHaveBeenCalled();
  });

  it('throws RoomAlreadyStarted when createFromRoom returns { ok: false, reason: "room_already_started" }', async () => {
    const roomWithPlayers = { ...mockRoom, players: [mockPlayer] };
    mockRoomRepo.findById.mockResolvedValue(roomWithPlayers);
    mockGameRepo.createFromRoom.mockResolvedValue({ ok: false, reason: 'room_already_started' });

    await expect(service.startGame('room123')).rejects.toBeInstanceOf(RoomAlreadyStarted);
  });

  it('throws RoomNotFound when createFromRoom returns { ok: false, reason: "room_not_found" }', async () => {
    const roomWithPlayers = { ...mockRoom, players: [mockPlayer] };
    mockRoomRepo.findById.mockResolvedValue(roomWithPlayers);
    mockGameRepo.createFromRoom.mockResolvedValue({ ok: false, reason: 'room_not_found' });

    await expect(service.startGame('room123')).rejects.toBeInstanceOf(RoomNotFound);
  });
});
