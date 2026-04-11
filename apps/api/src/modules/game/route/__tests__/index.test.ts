import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import ajvFormats from 'ajv-formats';
import { gameRoutes } from '../index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildMockController() {
  return {
    createGame: vi.fn(async (_req: unknown, reply: any) => reply.status(201).send({})),
    getGame: vi.fn(async (_req: unknown, reply: any) => reply.status(200).send({})),
    addPlayer: vi.fn(async (_req: unknown, reply: any) => reply.status(201).send({})),
    togglePriority: vi.fn(async (_req: unknown, reply: any) => reply.status(200).send({})),
    removePlayer: vi.fn(async (_req: unknown, reply: any) => reply.status(204).send()),
    reorderPlayers: vi.fn(async (_req: unknown, reply: any) => reply.status(200).send({})),
    setTeamCount: vi.fn(async (_req: unknown, reply: any) => reply.status(200).send({})),
    sortTeams: vi.fn(async (_req: unknown, reply: any) => reply.status(200).send({})),
  };
}

async function buildApp() {
  const fastify = Fastify({ logger: false, ajv: { plugins: [ajvFormats as never] } });
  await fastify.register(gameRoutes(buildMockController() as never), { prefix: '/games' });
  await fastify.ready();
  return fastify;
}

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_GAME_ID = 'a'.repeat(21);
const TOO_LONG_ID = 'a'.repeat(22);
const WRONG_FORMAT_ID = 'short';

// ---------------------------------------------------------------------------
// GET /games/:gameId
// ---------------------------------------------------------------------------

describe('GET /games/:gameId param validation', () => {
  it('returns 400 when gameId exceeds 21 characters', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: `/games/${TOO_LONG_ID}` });
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when gameId does not match alphanumeric pattern', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: `/games/${WRONG_FORMAT_ID}` });
    expect(res.statusCode).toBe(400);
  });

  it('passes when gameId is a valid 21-char alphanumeric id', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: `/games/${VALID_GAME_ID}` });
    expect(res.statusCode).not.toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /games/:gameId/players
// ---------------------------------------------------------------------------

describe('POST /games/:gameId/players param validation', () => {
  it('returns 400 when gameId exceeds 21 characters', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: `/games/${TOO_LONG_ID}/players`,
      headers: { 'content-type': 'application/json' },
      payload: { name: 'Alice' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when gameId does not match alphanumeric pattern', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: `/games/${WRONG_FORMAT_ID}/players`,
      headers: { 'content-type': 'application/json' },
      payload: { name: 'Alice' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('passes with a valid gameId and required body', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: `/games/${VALID_GAME_ID}/players`,
      headers: { 'content-type': 'application/json' },
      payload: { name: 'Alice' },
    });
    expect(res.statusCode).not.toBe(400);
  });
});

// ---------------------------------------------------------------------------
// PATCH /games/:gameId/players/:playerId
// ---------------------------------------------------------------------------

describe('PATCH /games/:gameId/players/:playerId param validation', () => {
  it('returns 400 when playerId is not a valid UUID', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'PATCH',
      url: `/games/${VALID_GAME_ID}/players/not-a-uuid`,
    });
    expect(res.statusCode).toBe(400);
  });

  it('passes when playerId is a valid UUID', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'PATCH',
      url: `/games/${VALID_GAME_ID}/players/${VALID_UUID}`,
    });
    expect(res.statusCode).not.toBe(400);
  });

  it('returns 400 when gameId exceeds 21 characters', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'PATCH',
      url: `/games/${TOO_LONG_ID}/players/${VALID_UUID}`,
    });
    expect(res.statusCode).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// DELETE /games/:gameId/players/:playerId
// ---------------------------------------------------------------------------

describe('DELETE /games/:gameId/players/:playerId param validation', () => {
  it('returns 400 when playerId is not a valid UUID', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'DELETE',
      url: `/games/${VALID_GAME_ID}/players/not-a-uuid`,
    });
    expect(res.statusCode).toBe(400);
  });

  it('passes when playerId is a valid UUID', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'DELETE',
      url: `/games/${VALID_GAME_ID}/players/${VALID_UUID}`,
    });
    expect(res.statusCode).not.toBe(400);
  });
});

// ---------------------------------------------------------------------------
// PATCH /games/:gameId
// ---------------------------------------------------------------------------

describe('PATCH /games/:gameId param validation', () => {
  it('returns 400 when gameId exceeds 21 characters', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'PATCH',
      url: `/games/${TOO_LONG_ID}`,
      headers: { 'content-type': 'application/json' },
      payload: { teamCount: 2 },
    });
    expect(res.statusCode).toBe(400);
  });

  it('passes with a valid gameId and teamCount', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'PATCH',
      url: `/games/${VALID_GAME_ID}`,
      headers: { 'content-type': 'application/json' },
      payload: { teamCount: 2 },
    });
    expect(res.statusCode).not.toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /games/:gameId/sort
// ---------------------------------------------------------------------------

describe('POST /games/:gameId/sort param validation', () => {
  it('returns 400 when gameId exceeds 21 characters', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'POST', url: `/games/${TOO_LONG_ID}/sort` });
    expect(res.statusCode).toBe(400);
  });

  it('passes with a valid gameId', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'POST', url: `/games/${VALID_GAME_ID}/sort` });
    expect(res.statusCode).not.toBe(400);
  });
});
