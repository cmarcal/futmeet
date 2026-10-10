import { describe, it, expect, afterEach, vi } from 'vitest';
import { getGameStorage } from '../gameStore';

describe('getGameStorage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return window.localStorage in the browser', () => {
    expect(getGameStorage()).toBe(window.localStorage);
  });

  it('should return an inert storage when window is not defined', () => {
    vi.stubGlobal('window', undefined);

    const storage = getGameStorage();

    expect(storage.getItem('key')).toBeNull();
    expect(storage.setItem('key', 'value')).toBeUndefined();
    expect(storage.getItem('key')).toBeNull();
    expect(storage.removeItem('key')).toBeUndefined();
  });
});
