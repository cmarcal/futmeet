import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import ajvFormats from 'ajv-formats';
import { roomRoutes } from '../index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildMockController() {
  return {
    createRoom: vi.fn(async (_req: unknown, reply: any) => reply.status(201).send({})),
    getRoom: vi.fn(async (_req: unknown, reply: any) => reply.status(200).send({})),
    addPlayer: vi.fn(async (_req: unknown, reply: any) => reply.status(201).send({})),
    togglePriority: vi.fn(async (_req: unknown, reply: any) => reply.status(200).send({})),
    removePlayer: vi.fn(async (_req: unknown, reply: any) => reply.status(204).send()),
    reorderPlayers: vi.fn(async (_req: unknown, reply: any) => reply.status(200).send({})),
    clearPlayers: vi.fn(async (_req: unknown, reply: any) => reply.status(204).send()),
    startGame: vi.fn(async (_req: unknown, reply: any) => reply.status(201).send({})),
  };
}

async function buildApp() {
  const fastify = Fastify({ logger: false, ajv: { plugins: [ajvFormats as never] } });
  await fastify.register(roomRoutes(buildMockController() as never), { prefix: '/rooms' });
  await fastify.ready();
  return fastify;
}

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const TOO_LONG_ID = 'a'.repeat(22);

// ---------------------------------------------------------------------------
// GET /rooms/:roomId
// ---------------------------------------------------------------------------

describe('GET /rooms/:roomId param validation', () => {
  it('returns 400 when roomId exceeds 21 characters', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: `/rooms/${TOO_LONG_ID}` });
    expect(res.statusCode).toBe(400);
  });

  it('passes when roomId is within 21 characters', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/rooms/valid-room-id' });
    expect(res.statusCode).not.toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /rooms/:roomId/players
// ---------------------------------------------------------------------------

describe('POST /rooms/:roomId/players param validation', () => {
  it('returns 400 when roomId exceeds 21 characters', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: `/rooms/${TOO_LONG_ID}/players`,
      headers: { 'content-type': 'application/json' },
      payload: { name: 'Alice' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('passes with a valid roomId and required body', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/rooms/room123/players',
      headers: { 'content-type': 'application/json' },
      payload: { name: 'Alice' },
    });
    expect(res.statusCode).not.toBe(400);
  });
});

// ---------------------------------------------------------------------------
// PATCH /rooms/:roomId/players/:playerId
// ---------------------------------------------------------------------------

describe('PATCH /rooms/:roomId/players/:playerId param validation', () => {
  it('returns 400 when playerId is not a valid UUID', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'PATCH',
      url: '/rooms/room123/players/not-a-uuid',
    });
    expect(res.statusCode).toBe(400);
  });

  it('passes when playerId is a valid UUID', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'PATCH',
      url: `/rooms/room123/players/${VALID_UUID}`,
    });
    expect(res.statusCode).not.toBe(400);
  });

  it('returns 400 when roomId exceeds 21 characters', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'PATCH',
      url: `/rooms/${TOO_LONG_ID}/players/${VALID_UUID}`,
    });
    expect(res.statusCode).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// DELETE /rooms/:roomId/players/:playerId
// ---------------------------------------------------------------------------

describe('DELETE /rooms/:roomId/players/:playerId param validation', () => {
  it('returns 400 when playerId is not a valid UUID', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'DELETE',
      url: '/rooms/room123/players/not-a-uuid',
    });
    expect(res.statusCode).toBe(400);
  });

  it('passes when playerId is a valid UUID', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'DELETE',
      url: `/rooms/room123/players/${VALID_UUID}`,
    });
    expect(res.statusCode).not.toBe(400);
  });
});

// ---------------------------------------------------------------------------
// DELETE /rooms/:roomId/players
// ---------------------------------------------------------------------------

describe('DELETE /rooms/:roomId/players param validation', () => {
  it('returns 400 when roomId exceeds 21 characters', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'DELETE', url: `/rooms/${TOO_LONG_ID}/players` });
    expect(res.statusCode).toBe(400);
  });

  it('passes with a valid roomId', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'DELETE', url: '/rooms/room123/players' });
    expect(res.statusCode).not.toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /rooms/:roomId/start
// ---------------------------------------------------------------------------

describe('POST /rooms/:roomId/start param validation', () => {
  it('returns 400 when roomId exceeds 21 characters', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'POST', url: `/rooms/${TOO_LONG_ID}/start` });
    expect(res.statusCode).toBe(400);
  });

  it('passes with a valid roomId', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'POST', url: '/rooms/room123/start' });
    expect(res.statusCode).not.toBe(400);
  });
});
