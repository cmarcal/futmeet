import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockDb, mockKnex } = vi.hoisted(() => {
  const mockDb = {
    migrate: { latest: vi.fn(), rollback: vi.fn(), list: vi.fn() },
    seed: { run: vi.fn() },
    destroy: vi.fn(),
  };
  return { mockDb, mockKnex: vi.fn(() => mockDb) };
});

vi.mock('knex', () => ({ default: mockKnex }));

const runScript = async (...args: string[]): Promise<void> => {
  process.argv = ['node', 'db.ts', ...args];
  vi.resetModules();
  await import('@/scripts/db.js');
};

describe('db script', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockDb.migrate.latest.mockResolvedValue([1, ['001_init']]);
    mockDb.migrate.rollback.mockResolvedValue([1, ['001_init']]);
    mockDb.migrate.list.mockResolvedValue([[{ name: 'a' }], [{ file: 'b' }]]);
    mockDb.destroy.mockResolvedValue(undefined);
    process.exitCode = undefined;
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  it('creates knex with the shared config', async () => {
    await runScript('migrate:latest');
    expect(mockKnex).toHaveBeenCalledWith(expect.objectContaining({ client: 'pg' }));
  });

  it('runs migrate:latest and destroys the connection', async () => {
    await runScript('migrate:latest');
    expect(mockDb.migrate.latest).toHaveBeenCalled();
    expect(mockDb.destroy).toHaveBeenCalled();
  });

  it('rolls back a single batch by default', async () => {
    await runScript('migrate:rollback');
    expect(mockDb.migrate.rollback).toHaveBeenCalledWith(undefined, false);
  });

  it('rolls back everything with --all', async () => {
    await runScript('migrate:rollback', '--all');
    expect(mockDb.migrate.rollback).toHaveBeenCalledWith(undefined, true);
  });

  it('lists migration status', async () => {
    await runScript('migrate:status');
    expect(mockDb.migrate.list).toHaveBeenCalled();
  });

  it('runs seeds', async () => {
    await runScript('seed:run');
    expect(mockDb.seed.run).toHaveBeenCalled();
  });

  it('sets a failing exit code for unknown commands and still destroys the connection', async () => {
    await runScript('bogus');
    expect(process.exitCode).toBe(1);
    expect(mockDb.destroy).toHaveBeenCalled();
  });
});
