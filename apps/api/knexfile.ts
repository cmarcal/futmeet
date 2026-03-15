import type { Knex } from 'knex';

const config: Knex.Config = {
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

export default config;
