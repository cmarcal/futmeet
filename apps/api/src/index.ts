import Fastify from 'fastify';
import ajvFormats from 'ajv-formats';
import { config } from './config.js';
import { logger } from '@core/logger/index.js';
import { createPool } from '@core/framework/postgres/index.js';
import { registerDbDecorator } from '@core/decorator/index.js';
import { registerErrorHandler } from '@core/error/index.js';
import { registerSecurity } from '@core/security/index.js';
import { registerSwagger } from '@core/documentation/swagger/index.js';
import { roomRoutes } from '@modules/room/route/index.js';
import { gameRoutes } from '@modules/game/route/index.js';
import { RoomRepository } from '@modules/room/repository/index.js';
import { RoomService } from '@modules/room/service/index.js';
import { RoomController } from '@modules/room/controller/index.js';
import { GameRepository } from '@modules/game/repository/index.js';
import { GameService } from '@modules/game/service/index.js';
import { GameController } from '@modules/game/controller/index.js';

const start = async (): Promise<void> => {
  const db = createPool(config.databaseUrl);

  const fastify = Fastify({
    logger,
    ajv: { plugins: [ajvFormats as never] },
    genReqId: () => crypto.randomUUID(),
  });

  // Core
  registerDbDecorator(fastify, db);
  registerErrorHandler(fastify);
  await registerSecurity(fastify);
  if (config.nodeEnv !== 'production') await registerSwagger(fastify);

  // Health
  fastify.get('/health', async () => ({ status: 'ok' }));

  // Composition root — wire repositories → services → controllers
  const roomRepository = new RoomRepository(db);
  const gameRepository = new GameRepository(db);
  const roomService = new RoomService(roomRepository, gameRepository);
  const roomController = new RoomController(roomService);

  const gameService = new GameService(gameRepository);
  const gameController = new GameController(gameService);

  // Routes
  await fastify.register(roomRoutes(roomController), { prefix: '/api/v1/rooms' });
  await fastify.register(gameRoutes(gameController), { prefix: '/api/v1/games' });

  await fastify.listen({ port: config.port, host: '0.0.0.0' });

  const shutdown = async (signal: string): Promise<void> => {
    fastify.log.info({ signal }, 'Shutting down');
    await fastify.close();
    await db.end();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start().catch((err: unknown) => {
  logger.error(err);
  process.exit(1);
});
