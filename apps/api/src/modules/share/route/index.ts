import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import type { ShareController } from '@modules/share/controller/index.js';

const ID_SCHEMA = { type: 'string', pattern: '^[A-Za-z0-9]{21}$' } as const;

const roomIdParam = {
  type: 'object',
  required: ['roomId'],
  properties: { roomId: ID_SCHEMA },
} as const;

const gameIdParam = {
  type: 'object',
  required: ['gameId'],
  properties: { gameId: ID_SCHEMA },
} as const;

export const shareRoutes =
  (controller: ShareController) =>
  async (fastify: FastifyInstance, _opts: FastifyPluginOptions): Promise<void> => {
    // GET /share/rooms/:roomId — OG/Twitter preview page, redirects to the SPA waiting room
    fastify.get('/rooms/:roomId', { schema: { params: roomIdParam } }, controller.getRoomPreview);

    // GET /share/results/:gameId — OG/Twitter preview page, redirects to the SPA results page
    fastify.get(
      '/results/:gameId',
      { schema: { params: gameIdParam } },
      controller.getResultsPreview
    );
  };
