import { describe, it, expect } from 'vitest';
import { generateGameId, isValidGameId } from '../gameId.js';

describe('generateGameId', () => {
  it('returns a string of exactly 21 characters', () => {
    const id = generateGameId();
    expect(id).toHaveLength(21);
  });

  it('matches /^[A-Za-z0-9]{21}$/ (no dashes or underscores)', () => {
    const id = generateGameId();
    expect(id).toMatch(/^[A-Za-z0-9]{21}$/);
  });

  it('generates unique values across 50 calls', () => {
    const ids = Array.from({ length: 50 }, () => generateGameId());
    const unique = new Set(ids);
    expect(unique.size).toBe(50);
  });
});

describe('isValidGameId', () => {
  it('returns true for a valid 21-char alphanumeric string', () => {
    expect(isValidGameId('ABCDEFGHIJKLMNOPabcde')).toBe(true);
  });

  it('returns false for a string containing _', () => {
    expect(isValidGameId('ABCDEFGHIJKLMNOPabc_e')).toBe(false);
  });

  it('returns false for a string containing -', () => {
    expect(isValidGameId('ABCDEFGHIJKLMNOPabc-e')).toBe(false);
  });

  it('returns false for a string shorter than 21 chars', () => {
    expect(isValidGameId('ABCDEFGHIJKLMNOPabcd')).toBe(false);
  });

  it('returns false for a string longer than 21 chars', () => {
    expect(isValidGameId('ABCDEFGHIJKLMNOPabcdef')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidGameId('')).toBe(false);
  });

  it('returns false for a valid nanoid that uses old alphabet (with _ or -)', () => {
    // Standard nanoid default alphabet includes _ and -; 21 chars but not strictly alphanumeric
    expect(isValidGameId('V1StGXR8_Z5jdHi6B-myT')).toBe(false);
  });
});
