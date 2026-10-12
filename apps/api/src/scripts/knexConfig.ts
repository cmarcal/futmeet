import type { Knex } from 'knex';

export const knexConfig: Knex.Config = {
  client: 'pg',
  connection: process.env['DATABASE_URL'],
  migrations: {
    directory: './src/migrations',
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
  seeds: {
    directory: './src/seeds',
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
};
