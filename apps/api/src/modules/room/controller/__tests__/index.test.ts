import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoomController } from '../index.js';

const makeReply = () =>
  ({
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  }) as any;

const makeRequest = (overrides: Record<string, unknown> = {}) =>
  ({ params: {}, body: {}, ...overrides }) as any;

const mockService = {
  createRoom: vi.fn(),
  getRoom: vi.fn(),
  addPlayer: vi.fn(),
  removePlayer: vi.fn(),
  togglePriority: vi.fn(),
  reorderPlayers: vi.fn(),
  clearPlayers: vi.fn(),
  startGame: vi.fn(),
};

const controller = new RoomController(mockService as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RoomController.createRoom', () => {
  it('calls service.createRoom and replies with status 201 and roomId', async () => {
    const room = { id: 'room-abc', players: [], createdAt: new Date() };
    mockService.createRoom.mockResolvedValue(room);

    const req = makeRequest();
    const reply = makeReply();

    await controller.createRoom(req, reply);

    expect(mockService.createRoom).toHaveBeenCalledTimes(1);
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({ roomId: room.id });
  });
});

describe('RoomController.getRoom', () => {
  it('calls service.getRoom with params.roomId and replies with room', async () => {
    const room = { id: 'room-abc', players: [], createdAt: new Date() };
    mockService.getRoom.mockResolvedValue(room);

    const req = makeRequest({ params: { roomId: 'room-abc' } });
    const reply = makeReply();

    await controller.getRoom(req, reply);

    expect(mockService.getRoom).toHaveBeenCalledWith('room-abc');
    expect(reply.send).toHaveBeenCalledWith(room);
  });
});

describe('RoomController.addPlayer', () => {
  it('calls service.addPlayer with roomId, name, and notes; replies with status 201 and player', async () => {
    const player = { id: 'player-1', name: 'Alice', priority: false, timestamp: new Date() };
    mockService.addPlayer.mockResolvedValue(player);

    const req = makeRequest({
      params: { roomId: 'room-abc' },
      body: { name: 'Alice', notes: 'goalie' },
    });
    const reply = makeReply();

    await controller.addPlayer(req, reply);

    expect(mockService.addPlayer).toHaveBeenCalledWith('room-abc', 'Alice', 'goalie');
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith(player);
  });
});

describe('RoomController.removePlayer', () => {
  it('calls service.removePlayer with roomId and playerId; replies with status 204', async () => {
    mockService.removePlayer.mockResolvedValue(undefined);

    const req = makeRequest({ params: { roomId: 'room-abc', playerId: 'player-1' } });
    const reply = makeReply();

    await controller.removePlayer(req, reply);

    expect(mockService.removePlayer).toHaveBeenCalledWith('room-abc', 'player-1');
    expect(reply.status).toHaveBeenCalledWith(204);
    expect(reply.send).toHaveBeenCalledWith();
  });
});

describe('RoomController.togglePriority', () => {
  it('calls service.togglePriority with roomId and playerId; replies with updated player', async () => {
    const player = { id: 'player-1', name: 'Alice', priority: true, timestamp: new Date() };
    mockService.togglePriority.mockResolvedValue(player);

    const req = makeRequest({ params: { roomId: 'room-abc', playerId: 'player-1' } });
    const reply = makeReply();

    await controller.togglePriority(req, reply);

    expect(mockService.togglePriority).toHaveBeenCalledWith('room-abc', 'player-1');
    expect(reply.send).toHaveBeenCalledWith(player);
  });
});

describe('RoomController.reorderPlayers', () => {
  it('calls service.reorderPlayers with roomId, fromIndex, and toIndex; replies with updated room', async () => {
    const room = { id: 'room-abc', players: [], createdAt: new Date() };
    mockService.reorderPlayers.mockResolvedValue(room);

    const req = makeRequest({
      params: { roomId: 'room-abc' },
      body: { fromIndex: 0, toIndex: 2 },
    });
    const reply = makeReply();

    await controller.reorderPlayers(req, reply);

    expect(mockService.reorderPlayers).toHaveBeenCalledWith('room-abc', 0, 2);
    expect(reply.send).toHaveBeenCalledWith(room);
  });
});

describe('RoomController.clearPlayers', () => {
  it('calls service.clearPlayers with roomId and replies with status 204', async () => {
    mockService.clearPlayers.mockResolvedValue(undefined);

    const req = makeRequest({ params: { roomId: 'room-abc' } });
    const reply = makeReply();

    await controller.clearPlayers(req, reply);

    expect(mockService.clearPlayers).toHaveBeenCalledWith('room-abc');
    expect(reply.status).toHaveBeenCalledWith(204);
    expect(reply.send).toHaveBeenCalledWith();
  });
});

describe('RoomController.startGame', () => {
  it('calls service.startGame with roomId and replies with status 201 and game', async () => {
    const game = { id: 'game-001', roomId: 'room-abc', players: [] };
    mockService.startGame.mockResolvedValue(game);

    const req = makeRequest({ params: { roomId: 'room-abc' } });
    const reply = makeReply();

    await controller.startGame(req, reply);

    expect(mockService.startGame).toHaveBeenCalledWith('room-abc');
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith(game);
  });
});
