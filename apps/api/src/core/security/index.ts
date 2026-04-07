import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import type { FastifyInstance } from 'fastify';
import { config } from '@/config.js';

export const registerSecurity = async (fastify: FastifyInstance): Promise<void> => {
  await fastify.register(fastifyHelmet, {
    contentSecurityPolicy: config.nodeEnv === 'production',
  });
  await fastify.register(fastifyCors, {
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });
  fastify.addHook('onRequest', async (request, reply) => {
    const pathname = request.url.split('?', 1)[0];
    if (pathname === '/health' || pathname === '/health/') return;
    if (request.headers['x-api-key'] !== config.apiKey) {
      return reply.status(401).send({ code: 'UNAUTHORIZED', message: 'Invalid or missing API key' });
    }
  });
};
