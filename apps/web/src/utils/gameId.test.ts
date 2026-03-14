import { describe, it, expect } from 'vitest';
import { generateGameId, isValidGameId } from './gameId';

describe('gameId', () => {
  describe('generateGameId', () => {
    it('should generate a 21-character string', () => {
      const id = generateGameId();
      expect(id).toHaveLength(21);
    });

    it('should generate alphanumeric IDs', () => {
      const id = generateGameId();
      expect(id).toMatch(/^[A-Za-z0-9]{21}$/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateGameId()));
      expect(ids.size).toBe(100);
    });
  });

  describe('isValidGameId', () => {
    it('should return true for valid 21-char alphanumeric ID', () => {
      expect(isValidGameId('V1StGXR8Z5jdHi6BmyT12')).toBe(true);
    });

    it('should return true for legacy IDs with underscore and hyphen', () => {
      expect(isValidGameId('V1StGXR8_Z5jdHi6B-myT')).toBe(true);
    });

    it('should return false for invalid length', () => {
      expect(isValidGameId('abc')).toBe(false);
      expect(isValidGameId('')).toBe(false);
      expect(isValidGameId('V1StGXR8Z5jdHi6BmyT12extra')).toBe(false);
    });

    it('should return false for invalid characters', () => {
      expect(isValidGameId('V1StGXR8Z5jdHi6BmyT!@')).toBe(false);
      expect(isValidGameId('V1StGXR8Z5jdHi6BmyT 1')).toBe(false);
    });
  });
});
