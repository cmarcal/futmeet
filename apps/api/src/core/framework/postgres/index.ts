import pg from 'pg';

const { Pool } = pg;

export type DbPool = InstanceType<typeof Pool>;
export type DbClient = pg.PoolClient;

export const createPool = (connectionString: string): DbPool =>
  new Pool({ connectionString, max: 10 });
