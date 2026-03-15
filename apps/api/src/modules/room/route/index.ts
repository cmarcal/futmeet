import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import type { RoomController } from '@modules/room/controller/index.js';

export const roomRoutes =
  (controller: RoomController) =>
  async (fastify: FastifyInstance, _opts: FastifyPluginOptions): Promise<void> => {
    // POST /api/v1/rooms — create room
    fastify.post('/', controller.createRoom);

    // GET /api/v1/rooms/:roomId — get room
    fastify.get('/:roomId', controller.getRoom);

    // POST /api/v1/rooms/:roomId/players — add player
    fastify.post(
      '/:roomId/players',
      {
        schema: {
          body: {
            type: 'object',
            required: ['name'],
            properties: {
              name: { type: 'string', minLength: 1, maxLength: 50 },
              notes: { type: 'string', maxLength: 500 },
            },
          },
        },
      },
      controller.addPlayer
    );

    // PATCH /api/v1/rooms/:roomId/players/:playerId — toggle priority
    fastify.patch('/:roomId/players/:playerId', controller.togglePriority);

    // DELETE /api/v1/rooms/:roomId/players/:playerId — remove player
    fastify.delete('/:roomId/players/:playerId', controller.removePlayer);

    // POST /api/v1/rooms/:roomId/players/reorder — reorder players
    fastify.post(
      '/:roomId/players/reorder',
      {
        schema: {
          body: {
            type: 'object',
            required: ['fromIndex', 'toIndex'],
            properties: {
              fromIndex: { type: 'integer', minimum: 0 },
              toIndex: { type: 'integer', minimum: 0 },
            },
          },
        },
      },
      controller.reorderPlayers
    );

    // DELETE /api/v1/rooms/:roomId/players — clear all players (room stays)
    fastify.delete('/:roomId/players', controller.clearPlayers);

    // POST /api/v1/rooms/:roomId/start — create game from room
    fastify.post('/:roomId/start', controller.startGame);
  };
