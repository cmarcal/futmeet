import { describe, expect, it } from 'vitest';
import { DB_SENSORS, nodeMismatch, SENSORS, selectSensors, summarize } from '../verify.mjs';

describe('selectSensors', () => {
  it('runs the base sensors by default', () => {
    expect(selectSensors({})).toEqual(SENSORS);
  });

  it('adds the database sensors when VERIFY_DB is set', () => {
    expect(selectSensors({ VERIFY_DB: '1' })).toEqual([...SENSORS, ...DB_SENSORS]);
  });

  it('keeps lint, typecheck, test and build in the base set', () => {
    expect(SENSORS).toEqual(expect.arrayContaining(['lint', 'typecheck', 'test', 'build']));
  });
});

describe('summarize', () => {
  it('lists only the red sensors', () => {
    const results = [
      { name: 'lint', green: true },
      { name: 'test', green: false },
      { name: 'build', green: false },
    ];
    expect(summarize(results)).toEqual({ red: ['test', 'build'] });
  });

  it('returns no red sensors when all are green', () => {
    expect(summarize([{ name: 'lint', green: true }])).toEqual({ red: [] });
  });
});

describe('nodeMismatch', () => {
  it('returns null when the major version matches', () => {
    expect(nodeMismatch('26\n', '26.1.0')).toBeNull();
  });

  it('returns the wanted version when the major differs', () => {
    expect(nodeMismatch('26\n', '22.22.0')).toBe('26');
  });
});
