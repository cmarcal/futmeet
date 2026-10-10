import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import ajvFormats from 'ajv-formats';
import { shareRoutes } from '@modules/share/route/index.js';

const buildMockController = () => ({
  getRoomPreview: vi.fn(async (_req: unknown, reply: any) => reply.status(200).send('room')),
  getResultsPreview: vi.fn(async (_req: unknown, reply: any) => reply.status(200).send('results')),
});

const buildApp = async (controller = buildMockController()) => {
  const fastify = Fastify({ logger: false, ajv: { plugins: [ajvFormats as never] } });
  await fastify.register(shareRoutes(controller as never), { prefix: '/share' });
  await fastify.ready();
  return { fastify, controller };
};

const VALID_ID = 'abcdefghijklmnopqrstu';

describe('share routes', () => {
  it('accepts a valid room id', async () => {
    const { fastify, controller } = await buildApp();
    const res = await fastify.inject({ method: 'GET', url: `/share/rooms/${VALID_ID}` });
    expect(res.statusCode).toBe(200);
    expect(controller.getRoomPreview).toHaveBeenCalled();
  });

  it('accepts a valid game id', async () => {
    const { fastify, controller } = await buildApp();
    const res = await fastify.inject({ method: 'GET', url: `/share/results/${VALID_ID}` });
    expect(res.statusCode).toBe(200);
    expect(controller.getResultsPreview).toHaveBeenCalled();
  });

  it.each([
    ['too short', 'abc'],
    ['too long', 'a'.repeat(22)],
    ['invalid characters', 'abcdefghijklmnopqrst-'],
    ['markup', '%3Cscript%3Ealert(1)%3C%2Fscript%3E'],
  ])('returns 400 for a room id that is %s', async (_label, id) => {
    const { fastify, controller } = await buildApp();
    const res = await fastify.inject({ method: 'GET', url: `/share/rooms/${id}` });
    expect(res.statusCode).toBe(400);
    expect(controller.getRoomPreview).not.toHaveBeenCalled();
  });

  it('returns 400 for an invalid game id', async () => {
    const { fastify, controller } = await buildApp();
    const res = await fastify.inject({ method: 'GET', url: '/share/results/not-valid' });
    expect(res.statusCode).toBe(400);
    expect(controller.getResultsPreview).not.toHaveBeenCalled();
  });
});
