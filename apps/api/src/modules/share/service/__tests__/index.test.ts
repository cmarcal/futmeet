import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShareService } from '@modules/share/service/index.js';
import { RoomNotFound } from '@modules/room/error/index.js';
import { GameNotFound } from '@modules/game/error/index.js';

const mockRoomRepo = { findById: vi.fn() };
const mockGameRepo = { findById: vi.fn() };
const service = new ShareService(mockRoomRepo as any, mockGameRepo as any, 'https://app.example.com/');

const ROOM_ID = 'abcdefghijklmnopqrstu';

const player = (name: string) => ({ id: name, name, priority: false, timestamp: new Date() });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ShareService.getRoomPreviewHtml', () => {
  it('throws RoomNotFound when the room does not exist', async () => {
    mockRoomRepo.findById.mockResolvedValue(null);
    await expect(service.getRoomPreviewHtml(ROOM_ID)).rejects.toBeInstanceOf(RoomNotFound);
  });

  it('redirects to the SPA waiting room without a double slash', async () => {
    mockRoomRepo.findById.mockResolvedValue({ id: ROOM_ID, players: [], createdAt: new Date() });
    const html = await service.getRoomPreviewHtml(ROOM_ID);
    expect(html).toContain(`url=https://app.example.com/waiting-room/${ROOM_ID}"`);
    expect(html).toContain('Join the room and sign up for the game.');
  });

  it('lists up to five player names and summarizes the rest', async () => {
    const players = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(player);
    mockRoomRepo.findById.mockResolvedValue({ id: ROOM_ID, players, createdAt: new Date() });
    const html = await service.getRoomPreviewHtml(ROOM_ID);
    expect(html).toContain('7 players signed up: A, B, C, D, E, +2 more');
  });

  it('uses the singular for one player', async () => {
    mockRoomRepo.findById.mockResolvedValue({
      id: ROOM_ID,
      players: [player('Solo')],
      createdAt: new Date(),
    });
    const html = await service.getRoomPreviewHtml(ROOM_ID);
    expect(html).toContain('1 player signed up: Solo');
  });

  it('escapes user-controlled player names', async () => {
    mockRoomRepo.findById.mockResolvedValue({
      id: ROOM_ID,
      players: [player('<script>alert(1)</script>')],
      createdAt: new Date(),
    });
    const html = await service.getRoomPreviewHtml(ROOM_ID);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('ShareService.getResultsPreviewHtml', () => {
  it('throws GameNotFound when the game does not exist', async () => {
    mockGameRepo.findById.mockResolvedValue(null);
    await expect(service.getResultsPreviewHtml(ROOM_ID)).rejects.toBeInstanceOf(GameNotFound);
  });

  it('summarizes teams and redirects to the SPA results page', async () => {
    mockGameRepo.findById.mockResolvedValue({
      id: ROOM_ID,
      players: [],
      teams: [
        { id: '1', name: 'Team A', players: [player('a'), player('b')] },
        { id: '2', name: 'Team B', players: [player('c')] },
      ],
    });
    const html = await service.getResultsPreviewHtml(ROOM_ID);
    expect(html).toContain('Team A (2) · Team B (1)');
    expect(html).toContain(`url=https://app.example.com/results/${ROOM_ID}"`);
  });

  it('falls back to a player count when there are no teams', async () => {
    mockGameRepo.findById.mockResolvedValue({
      id: ROOM_ID,
      players: [player('a'), player('b')],
      teams: [],
    });
    const html = await service.getResultsPreviewHtml(ROOM_ID);
    expect(html).toContain('2 players ready to be sorted into teams.');
  });

  it('escapes team names', async () => {
    mockGameRepo.findById.mockResolvedValue({
      id: ROOM_ID,
      players: [],
      teams: [{ id: '1', name: '"><img src=x>', players: [] }],
    });
    const html = await service.getResultsPreviewHtml(ROOM_ID);
    expect(html).not.toContain('<img');
  });
});
