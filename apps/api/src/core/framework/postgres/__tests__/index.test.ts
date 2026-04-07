import { describe, it, expect, vi, beforeEach } from 'vitest';

const { MockPool } = vi.hoisted(() => ({ MockPool: vi.fn() }));
vi.mock('pg', () => ({ default: { Pool: MockPool } }));

import { createPool } from '../index.js';

describe('createPool', () => {
  beforeEach(() => {
    MockPool.mockReset();
  });

  it('passes connectionString to Pool', () => {
    createPool('postgresql://localhost/test');
    expect(MockPool).toHaveBeenCalledWith(
      expect.objectContaining({ connectionString: 'postgresql://localhost/test' })
    );
  });

  it('sets max connections to 10', () => {
    createPool('postgresql://localhost/test');
    expect(MockPool).toHaveBeenCalledWith(expect.objectContaining({ max: 10 }));
  });

  it('sets idleTimeoutMillis to 30 000 ms', () => {
    createPool('postgresql://localhost/test');
    expect(MockPool).toHaveBeenCalledWith(
      expect.objectContaining({ idleTimeoutMillis: 30_000 })
    );
  });

  it('sets connectionTimeoutMillis to 5 000 ms', () => {
    createPool('postgresql://localhost/test');
    expect(MockPool).toHaveBeenCalledWith(
      expect.objectContaining({ connectionTimeoutMillis: 5_000 })
    );
  });

  it('returns the Pool instance', () => {
    const fakePool = {};
    MockPool.mockReturnValue(fakePool);
    const result = createPool('postgresql://localhost/test');
    expect(result).toBe(fakePool);
  });
});
