import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export const registerSwagger = async (fastify: FastifyInstance): Promise<void> => {
  await fastify.register(swagger, {
    openapi: {
      info: { title: 'Futmeet API', version: '1.0.0' },
      servers: [{ url: '/api/v1' }],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list' },
  });
};
