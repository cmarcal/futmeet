import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const ROOM_ID = 'V1StGXR8_Z5jdHi6B-myT';
const STORAGE_KEY = 'futmeet-games-storage';

const persistedState = {
  state: {
    games: {},
    waitingRooms: {
      [ROOM_ID]: [{ id: 'p1', name: 'Alice', timestamp: '2026-01-01T00:00:00.000Z', priority: false }],
    },
  },
  version: 0,
};

const loadFreshModules = async () => {
  vi.resetModules();
  const { useWaitingRoom } = await import('../../hooks/useWaitingRoom');
  const { useGameStore } = await import('../gameStore');

  const Probe = () => {
    const { players } = useWaitingRoom(ROOM_ID);
    return <p data-testid="count">{players.length}</p>;
  };

  return { Probe, useGameStore };
};

describe('gameStore hydration with server-rendered markup', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('should hydrate without a mismatch and then show the persisted players', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { Probe, useGameStore } = await loadFreshModules();

    expect(useGameStore.getState().waitingRooms[ROOM_ID]).toHaveLength(1);

    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = renderToString(<Probe />);
    expect(container.textContent).toBe('0');

    await act(async () => {
      hydrateRoot(container, <Probe />, { onRecoverableError: errorSpy });
    });

    expect(errorSpy).not.toHaveBeenCalled();
    expect(container.textContent).toBe('1');
  });

  it('should keep the persisted players after the init effect runs', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
    const { Probe, useGameStore } = await loadFreshModules();

    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = renderToString(<Probe />);

    await act(async () => {
      hydrateRoot(container, <Probe />);
    });

    expect(useGameStore.getState().waitingRooms[ROOM_ID]).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) as string).state.waitingRooms[ROOM_ID]).toHaveLength(1);
  });
});
