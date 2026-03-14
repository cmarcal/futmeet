import type { FastifyInstance } from 'fastify';
import type { DbPool } from '@core/framework/postgres/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: DbPool;
  }
}

export const registerDbDecorator = (fastify: FastifyInstance, db: DbPool): void => {
  fastify.decorate('db', db);
};
