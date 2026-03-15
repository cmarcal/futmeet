import { describe, it, expect } from 'vitest';
import { generatePlayerId } from '../playerId.js';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('generatePlayerId', () => {
  it('returns a string matching UUID v4 format', () => {
    const id = generatePlayerId();
    expect(id).toMatch(UUID_V4_REGEX);
  });

  it('generates unique values across 50 calls', () => {
    const ids = Array.from({ length: 50 }, () => generatePlayerId());
    const unique = new Set(ids);
    expect(unique.size).toBe(50);
  });
});
