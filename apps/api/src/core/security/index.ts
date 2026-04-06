import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import type { FastifyInstance } from 'fastify';
import { config } from '@/config.js';

export const registerSecurity = async (fastify: FastifyInstance): Promise<void> => {
  await fastify.register(fastifyHelmet);
  await fastify.register(fastifyCors, {
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });
  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url === '/health') return;
    if (request.headers['x-api-key'] !== config.apiKey) {
      return reply.status(401).send({ code: 'UNAUTHORIZED', message: 'Invalid or missing API key' });
    }
  });
};
