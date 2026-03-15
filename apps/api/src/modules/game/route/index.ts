import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import type { GameController } from '@modules/game/controller/index.js';

export const gameRoutes =
  (controller: GameController) =>
  async (fastify: FastifyInstance, _opts: FastifyPluginOptions): Promise<void> => {
    // POST /api/v1/games — create empty game
    fastify.post('/', controller.createGame);

    // GET /api/v1/games/:gameId
    fastify.get('/:gameId', controller.getGame);

    // POST /api/v1/games/:gameId/players — add player
    fastify.post(
      '/:gameId/players',
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

    // PATCH /api/v1/games/:gameId/players/:playerId — toggle priority only
    fastify.patch('/:gameId/players/:playerId', controller.togglePriority);

    // DELETE /api/v1/games/:gameId/players/:playerId — remove player
    fastify.delete('/:gameId/players/:playerId', controller.removePlayer);

    // POST /api/v1/games/:gameId/players/reorder — reorder
    fastify.post(
      '/:gameId/players/reorder',
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

    // PATCH /api/v1/games/:gameId — set teamCount only
    fastify.patch(
      '/:gameId',
      {
        schema: {
          body: {
            type: 'object',
            required: ['teamCount'],
            properties: {
              teamCount: { type: 'integer', minimum: 2, maximum: 10 },
            },
          },
        },
      },
      controller.setTeamCount
    );

    // POST /api/v1/games/:gameId/sort — run sort (setup → complete, re-sort safe)
    fastify.post('/:gameId/sort', controller.sortTeams);
  };
