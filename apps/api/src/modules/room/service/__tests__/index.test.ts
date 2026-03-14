import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoomService } from '../index.js';
import {
  RoomNotFound,
  RoomPlayerNotFound,
  RoomAlreadyStarted,
  InvalidReorderIndices,
} from '../../error/index.js';

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
  it('calls roomRepo.addPlayer with correct args when room exists and not started', async () => {
    mockRoomRepo.findById.mockResolvedValue(mockRoom);
    mockRoomRepo.hasGame.mockResolvedValue(false);
    mockRoomRepo.addPlayer.mockResolvedValue(mockPlayer);

    const result = await service.addPlayer('room123', 'Alice', 'some notes');

    expect(mockRoomRepo.addPlayer).toHaveBeenCalledWith('room123', 'Alice', 'some notes');
    expect(result).toBe(mockPlayer);
  });

  it('throws RoomNotFound when findById returns null', async () => {
    mockRoomRepo.findById.mockResolvedValue(null);

    await expect(service.addPlayer('missing-room', 'Alice')).rejects.toBeInstanceOf(RoomNotFound);
  });

  it('throws RoomAlreadyStarted when hasGame returns true', async () => {
    mockRoomRepo.findById.mockResolvedValue(mockRoom);
    mockRoomRepo.hasGame.mockResolvedValue(true);

    await expect(service.addPlayer('room123', 'Alice')).rejects.toBeInstanceOf(RoomAlreadyStarted);
  });
});

describe('RoomService.removePlayer', () => {
  it('calls roomRepo.removePlayer and resolves successfully when removePlayer returns true', async () => {
    mockRoomRepo.findById.mockResolvedValue(mockRoom);
    mockRoomRepo.hasGame.mockResolvedValue(false);
    mockRoomRepo.removePlayer.mockResolvedValue(true);

    await expect(service.removePlayer('room123', mockPlayer.id)).resolves.toBeUndefined();

    expect(mockRoomRepo.removePlayer).toHaveBeenCalledWith('room123', mockPlayer.id);
  });

  it('throws RoomPlayerNotFound when removePlayer returns false', async () => {
    mockRoomRepo.findById.mockResolvedValue(mockRoom);
    mockRoomRepo.hasGame.mockResolvedValue(false);
    mockRoomRepo.removePlayer.mockResolvedValue(false);

    await expect(service.removePlayer('room123', 'ghost-player')).rejects.toBeInstanceOf(RoomPlayerNotFound);
  });

  it('throws RoomNotFound when room not found', async () => {
    mockRoomRepo.findById.mockResolvedValue(null);

    await expect(service.removePlayer('missing-room', mockPlayer.id)).rejects.toBeInstanceOf(RoomNotFound);
  });
});

describe('RoomService.togglePriority', () => {
  it('calls setPriority with toggled value (false→true) and returns the updated player', async () => {
    const playerWithPriorityFalse = { ...mockPlayer, priority: false };
    const roomWithPlayer = { ...mockRoom, players: [playerWithPriorityFalse] };
    const updatedPlayer = { ...playerWithPriorityFalse, priority: true };

    // assertRoomExists calls findById once, then assertNotStarted calls hasGame,
    // then togglePriority calls findById again internally
    mockRoomRepo.findById
      .mockResolvedValueOnce(roomWithPlayer) // assertRoomExists
      .mockResolvedValueOnce(roomWithPlayer); // internal findById after assertNotStarted
    mockRoomRepo.hasGame.mockResolvedValue(false);
    mockRoomRepo.setPriority.mockResolvedValue(updatedPlayer);

    const result = await service.togglePriority('room123', playerWithPriorityFalse.id);

    expect(mockRoomRepo.setPriority).toHaveBeenCalledWith('room123', playerWithPriorityFalse.id, true);
    expect(result).toBe(updatedPlayer);
  });

  it('throws RoomPlayerNotFound when player is not in room', async () => {
    const emptyRoom = { ...mockRoom, players: [] };

    mockRoomRepo.findById
      .mockResolvedValueOnce(emptyRoom) // assertRoomExists
      .mockResolvedValueOnce(emptyRoom); // internal findById
    mockRoomRepo.hasGame.mockResolvedValue(false);

    await expect(service.togglePriority('room123', 'non-existent-player')).rejects.toBeInstanceOf(RoomPlayerNotFound);
  });

  it('throws RoomNotFound when room not found', async () => {
    mockRoomRepo.findById.mockResolvedValue(null);

    await expect(service.togglePriority('missing-room', mockPlayer.id)).rejects.toBeInstanceOf(RoomNotFound);
  });
});

describe('RoomService.reorderPlayers', () => {
  it('calls roomRepo.reorder and returns updated room when reorder returns true', async () => {
    const reorderedRoom = { ...mockRoom, players: [mockPlayer] };

    // assertRoomExists calls findById once, then reorderPlayers calls findById again at the end
    mockRoomRepo.findById
      .mockResolvedValueOnce(mockRoom)   // assertRoomExists
      .mockResolvedValueOnce(reorderedRoom); // final findById to return updated room
    mockRoomRepo.hasGame.mockResolvedValue(false);
    mockRoomRepo.reorder.mockResolvedValue(true);

    const result = await service.reorderPlayers('room123', 0, 1);

    expect(mockRoomRepo.reorder).toHaveBeenCalledWith('room123', 0, 1);
    expect(result).toBe(reorderedRoom);
  });

  it('throws InvalidReorderIndices when reorder returns false', async () => {
    mockRoomRepo.findById.mockResolvedValue(mockRoom);
    mockRoomRepo.hasGame.mockResolvedValue(false);
    mockRoomRepo.reorder.mockResolvedValue(false);

    await expect(service.reorderPlayers('room123', 99, 100)).rejects.toBeInstanceOf(InvalidReorderIndices);
  });
});

describe('RoomService.clearPlayers', () => {
  it('calls roomRepo.clearPlayers when room exists and not started', async () => {
    mockRoomRepo.findById.mockResolvedValue(mockRoom);
    mockRoomRepo.hasGame.mockResolvedValue(false);
    mockRoomRepo.clearPlayers.mockResolvedValue(undefined);

    await service.clearPlayers('room123');

    expect(mockRoomRepo.clearPlayers).toHaveBeenCalledWith('room123');
  });

  it('throws RoomNotFound when room not found', async () => {
    mockRoomRepo.findById.mockResolvedValue(null);

    await expect(service.clearPlayers('missing-room')).rejects.toBeInstanceOf(RoomNotFound);
  });

  it('throws RoomAlreadyStarted when game has already started', async () => {
    mockRoomRepo.findById.mockResolvedValue(mockRoom);
    mockRoomRepo.hasGame.mockResolvedValue(true);

    await expect(service.clearPlayers('room123')).rejects.toBeInstanceOf(RoomAlreadyStarted);
  });
});

describe('RoomService.startGame', () => {
  it('calls gameRepo.createFromRoom with roomId and players', async () => {
    const roomWithPlayers = { ...mockRoom, players: [mockPlayer] };
    const mockGame = { id: 'game-001', roomId: 'room123', players: [mockPlayer] };

    mockRoomRepo.findById.mockResolvedValue(roomWithPlayers);
    mockGameRepo.createFromRoom.mockResolvedValue(mockGame);

    const result = await service.startGame('room123');

    expect(mockGameRepo.createFromRoom).toHaveBeenCalledWith('room123', roomWithPlayers.players);
    expect(result).toBe(mockGame);
  });

  it('throws RoomNotFound when room not found', async () => {
    mockRoomRepo.findById.mockResolvedValue(null);

    await expect(service.startGame('missing-room')).rejects.toBeInstanceOf(RoomNotFound);
  });
});
