import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService } from '../index.js';
import {
  GameNotFound,
  GamePlayerNotFound,
  InvalidReorderIndices,
  InvalidTeamCount,
} from '../../error/index.js';

const mockGame = {
  id: 'game123',
  roomId: null,
  players: [{ id: crypto.randomUUID(), name: 'Alice', priority: false, timestamp: new Date() }],
  teamCount: 2,
  gameStatus: 'setup' as const,
  teams: [],
  createdAt: new Date(),
};

const mockPlayer = { id: crypto.randomUUID(), name: 'Bob', priority: false, timestamp: new Date() };

const mockGameRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  addPlayer: vi.fn(),
  removePlayer: vi.fn(),
  setPriority: vi.fn(),
  reorder: vi.fn(),
  setTeamCount: vi.fn(),
  sort: vi.fn(),
};

const service = new GameService(mockGameRepo as any);

beforeEach(() => vi.clearAllMocks());

describe('GameService.createGame', () => {
  it('calls gameRepo.create and returns its result', async () => {
    mockGameRepo.create.mockResolvedValue(mockGame);

    const result = await service.createGame();

    expect(mockGameRepo.create).toHaveBeenCalledOnce();
    expect(result).toBe(mockGame);
  });
});

describe('GameService.getGame', () => {
  it('returns game when findById resolves a game', async () => {
    mockGameRepo.findById.mockResolvedValue(mockGame);

    const result = await service.getGame('game123');

    expect(mockGameRepo.findById).toHaveBeenCalledWith('game123');
    expect(result).toBe(mockGame);
  });

  it('throws GameNotFound when findById resolves null', async () => {
    mockGameRepo.findById.mockResolvedValue(null);

    await expect(service.getGame('game123')).rejects.toThrow(GameNotFound);
  });
});

describe('GameService.addPlayer', () => {
  it('calls gameRepo.addPlayer with gameId, name, notes when game exists', async () => {
    mockGameRepo.findById.mockResolvedValue(mockGame);
    mockGameRepo.addPlayer.mockResolvedValue(mockPlayer);

    const result = await service.addPlayer('game123', 'Bob', 'some notes');

    expect(mockGameRepo.findById).toHaveBeenCalledWith('game123');
    expect(mockGameRepo.addPlayer).toHaveBeenCalledWith('game123', 'Bob', 'some notes');
    expect(result).toBe(mockPlayer);
  });

  it('throws GameNotFound when findById returns null (assertGameExists)', async () => {
    mockGameRepo.findById.mockResolvedValue(null);

    await expect(service.addPlayer('game123', 'Bob')).rejects.toThrow(GameNotFound);
    expect(mockGameRepo.addPlayer).not.toHaveBeenCalled();
  });
});

describe('GameService.removePlayer', () => {
  it('calls gameRepo.removePlayer when game exists and resolves when it returns true', async () => {
    mockGameRepo.findById.mockResolvedValue(mockGame);
    mockGameRepo.removePlayer.mockResolvedValue(true);

    await expect(service.removePlayer('game123', 'player456')).resolves.toBeUndefined();

    expect(mockGameRepo.removePlayer).toHaveBeenCalledWith('game123', 'player456');
  });

  it('throws GamePlayerNotFound when removePlayer returns false', async () => {
    mockGameRepo.findById.mockResolvedValue(mockGame);
    mockGameRepo.removePlayer.mockResolvedValue(false);

    await expect(service.removePlayer('game123', 'player456')).rejects.toThrow(GamePlayerNotFound);
  });

  it('throws GameNotFound when game not found', async () => {
    mockGameRepo.findById.mockResolvedValue(null);

    await expect(service.removePlayer('game123', 'player456')).rejects.toThrow(GameNotFound);
    expect(mockGameRepo.removePlayer).not.toHaveBeenCalled();
  });
});

describe('GameService.togglePriority', () => {
  it('calls setPriority with toggled value for found player and returns result', async () => {
    // mockGame.players[0] has priority: false, so toggled value should be true
    const updatedPlayer = { ...mockGame.players[0], priority: true };
    mockGameRepo.findById.mockResolvedValue(mockGame);
    mockGameRepo.setPriority.mockResolvedValue(updatedPlayer);

    const result = await service.togglePriority('game123', mockGame.players[0].id);

    expect(mockGameRepo.setPriority).toHaveBeenCalledWith('game123', mockGame.players[0].id, true);
    expect(result).toBe(updatedPlayer);
  });

  it('throws GamePlayerNotFound when player is not in game players array', async () => {
    mockGameRepo.findById.mockResolvedValue(mockGame);

    await expect(service.togglePriority('game123', 'nonexistent-player')).rejects.toThrow(
      GamePlayerNotFound
    );
    expect(mockGameRepo.setPriority).not.toHaveBeenCalled();
  });

  it('throws GameNotFound when game not found', async () => {
    mockGameRepo.findById.mockResolvedValue(null);

    await expect(service.togglePriority('game123', 'player456')).rejects.toThrow(GameNotFound);
  });
});

describe('GameService.reorderPlayers', () => {
  it('calls gameRepo.reorder and returns updated game when reorder returns true', async () => {
    mockGameRepo.findById
      .mockResolvedValueOnce(mockGame) // assertGameExists
      .mockResolvedValueOnce(mockGame); // final findById after reorder
    mockGameRepo.reorder.mockResolvedValue(true);

    const result = await service.reorderPlayers('game123', 0, 1);

    expect(mockGameRepo.reorder).toHaveBeenCalledWith('game123', 0, 1);
    expect(result).toBe(mockGame);
  });

  it('throws InvalidReorderIndices when reorder returns false', async () => {
    mockGameRepo.findById.mockResolvedValue(mockGame);
    mockGameRepo.reorder.mockResolvedValue(false);

    await expect(service.reorderPlayers('game123', 0, 99)).rejects.toThrow(InvalidReorderIndices);
  });
});

describe('GameService.setTeamCount', () => {
  it('calls gameRepo.setTeamCount(gameId, teamCount) and returns result', async () => {
    const updatedGame = { ...mockGame, teamCount: 3 };
    mockGameRepo.setTeamCount.mockResolvedValue(updatedGame);

    const result = await service.setTeamCount('game123', 3);

    expect(mockGameRepo.setTeamCount).toHaveBeenCalledWith('game123', 3);
    expect(result).toBe(updatedGame);
  });

  it('throws InvalidTeamCount when teamCount is less than 2 (e.g., 1)', async () => {
    await expect(service.setTeamCount('game123', 1)).rejects.toThrow(InvalidTeamCount);
    expect(mockGameRepo.setTeamCount).not.toHaveBeenCalled();
  });

  it('throws InvalidTeamCount when teamCount is greater than 10 (e.g., 11)', async () => {
    await expect(service.setTeamCount('game123', 11)).rejects.toThrow(InvalidTeamCount);
    expect(mockGameRepo.setTeamCount).not.toHaveBeenCalled();
  });

  it('throws GameNotFound when setTeamCount returns null', async () => {
    mockGameRepo.setTeamCount.mockResolvedValue(null);

    await expect(service.setTeamCount('game123', 2)).rejects.toThrow(GameNotFound);
  });
});

describe('GameService.sortTeams', () => {
  it('calls gameRepo.sort(gameId) and returns result', async () => {
    const sortedGame = { ...mockGame, teams: [['Alice']] };
    mockGameRepo.sort.mockResolvedValue(sortedGame);

    const result = await service.sortTeams('game123');

    expect(mockGameRepo.sort).toHaveBeenCalledWith('game123');
    expect(result).toBe(sortedGame);
  });

  it('throws GameNotFound when sort returns null', async () => {
    mockGameRepo.sort.mockResolvedValue(null);

    await expect(service.sortTeams('game123')).rejects.toThrow(GameNotFound);
  });
});
