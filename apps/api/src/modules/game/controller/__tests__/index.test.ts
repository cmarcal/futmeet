import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameController } from '../index.js';

const mockService = {
  createGame: vi.fn(),
  getGame: vi.fn(),
  addPlayer: vi.fn(),
  removePlayer: vi.fn(),
  togglePriority: vi.fn(),
  reorderPlayers: vi.fn(),
  setTeamCount: vi.fn(),
  sortTeams: vi.fn(),
};

const controller = new GameController(mockService as any);

const makeReply = () => ({
  status: vi.fn().mockReturnThis(),
  send: vi.fn().mockReturnThis(),
});

const makeRequest = (overrides: Record<string, unknown> = {}) =>
  ({ params: {}, body: {}, ...overrides }) as any;

beforeEach(() => vi.clearAllMocks());

describe('GameController.createGame', () => {
  it('calls service.createGame and replies with status 201 and { gameId: game.id }', async () => {
    const game = { id: 'game123' };
    mockService.createGame.mockResolvedValue(game);
    const req = makeRequest();
    const reply = makeReply();

    await controller.createGame(req, reply as any);

    expect(mockService.createGame).toHaveBeenCalledOnce();
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({ gameId: game.id });
  });
});

describe('GameController.getGame', () => {
  it('calls service.getGame with params.gameId and sends the game', async () => {
    const game = { id: 'game123', players: [] };
    mockService.getGame.mockResolvedValue(game);
    const req = makeRequest({ params: { gameId: 'game123' } });
    const reply = makeReply();

    await controller.getGame(req, reply as any);

    expect(mockService.getGame).toHaveBeenCalledWith('game123');
    expect(reply.send).toHaveBeenCalledWith(game);
  });
});

describe('GameController.addPlayer', () => {
  it('calls service.addPlayer with (gameId, name, notes) and replies with status 201 and player', async () => {
    const player = { id: 'player456', name: 'Bob' };
    mockService.addPlayer.mockResolvedValue(player);
    const req = makeRequest({
      params: { gameId: 'game123' },
      body: { name: 'Bob', notes: 'some notes' },
    });
    const reply = makeReply();

    await controller.addPlayer(req, reply as any);

    expect(mockService.addPlayer).toHaveBeenCalledWith('game123', 'Bob', 'some notes');
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith(player);
  });
});

describe('GameController.removePlayer', () => {
  it('calls service.removePlayer with (gameId, playerId) and replies with status 204', async () => {
    mockService.removePlayer.mockResolvedValue(undefined);
    const req = makeRequest({ params: { gameId: 'game123', playerId: 'player456' } });
    const reply = makeReply();

    await controller.removePlayer(req, reply as any);

    expect(mockService.removePlayer).toHaveBeenCalledWith('game123', 'player456');
    expect(reply.status).toHaveBeenCalledWith(204);
    expect(reply.send).toHaveBeenCalledWith();
  });
});

describe('GameController.togglePriority', () => {
  it('calls service.togglePriority with (gameId, playerId) and sends the updated player', async () => {
    const player = { id: 'player456', name: 'Alice', priority: true };
    mockService.togglePriority.mockResolvedValue(player);
    const req = makeRequest({ params: { gameId: 'game123', playerId: 'player456' } });
    const reply = makeReply();

    await controller.togglePriority(req, reply as any);

    expect(mockService.togglePriority).toHaveBeenCalledWith('game123', 'player456');
    expect(reply.send).toHaveBeenCalledWith(player);
  });
});

describe('GameController.reorderPlayers', () => {
  it('calls service.reorderPlayers with (gameId, fromIndex, toIndex) and sends the updated game', async () => {
    const game = { id: 'game123', players: [] };
    mockService.reorderPlayers.mockResolvedValue(game);
    const req = makeRequest({
      params: { gameId: 'game123' },
      body: { fromIndex: 0, toIndex: 2 },
    });
    const reply = makeReply();

    await controller.reorderPlayers(req, reply as any);

    expect(mockService.reorderPlayers).toHaveBeenCalledWith('game123', 0, 2);
    expect(reply.send).toHaveBeenCalledWith(game);
  });
});

describe('GameController.setTeamCount', () => {
  it('calls service.setTeamCount with (gameId, teamCount) and sends the updated game', async () => {
    const game = { id: 'game123', teamCount: 4 };
    mockService.setTeamCount.mockResolvedValue(game);
    const req = makeRequest({
      params: { gameId: 'game123' },
      body: { teamCount: 4 },
    });
    const reply = makeReply();

    await controller.setTeamCount(req, reply as any);

    expect(mockService.setTeamCount).toHaveBeenCalledWith('game123', 4);
    expect(reply.send).toHaveBeenCalledWith(game);
  });
});

describe('GameController.sortTeams', () => {
  it('calls service.sortTeams with gameId and sends the updated game', async () => {
    const game = { id: 'game123', teams: [['Alice', 'Bob']] };
    mockService.sortTeams.mockResolvedValue(game);
    const req = makeRequest({ params: { gameId: 'game123' } });
    const reply = makeReply();

    await controller.sortTeams(req, reply as any);

    expect(mockService.sortTeams).toHaveBeenCalledWith('game123');
    expect(reply.send).toHaveBeenCalledWith(game);
  });
});
