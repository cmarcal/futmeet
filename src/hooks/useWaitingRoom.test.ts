import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWaitingRoom } from './useWaitingRoom';
import { useGameStore } from '../stores/gameStore';

const VALID_ROOM_ID = 'V1StGXR8_Z5jdHi6B-myT';

describe('useWaitingRoom', () => {
  beforeEach(() => {
    useGameStore.setState({ waitingRooms: {} });
  });

  describe('initial state', () => {
    it('should return empty players when room has no players', () => {
      const { result } = renderHook(() => useWaitingRoom(VALID_ROOM_ID));

      expect(result.current.players).toEqual([]);
    });

    it('should return all handlers', () => {
      const { result } = renderHook(() => useWaitingRoom(VALID_ROOM_ID));

      expect(typeof result.current.addPlayer).toBe('function');
      expect(typeof result.current.removePlayer).toBe('function');
      expect(typeof result.current.togglePriority).toBe('function');
      expect(typeof result.current.reorderPlayers).toBe('function');
      expect(typeof result.current.clearWaitingRoom).toBe('function');
      expect(typeof result.current.createGameFromWaitingRoom).toBe('function');
    });
  });

  describe('addPlayer', () => {
    it('should add a player to the waiting room', () => {
      const { result } = renderHook(() => useWaitingRoom(VALID_ROOM_ID));

      act(() => {
        result.current.addPlayer('Alice');
      });

      expect(result.current.players).toHaveLength(1);
      expect(result.current.players[0].name).toBe('Alice');
      expect(result.current.players[0].priority).toBe(false);
      expect(result.current.players[0].id).toBeTruthy();
    });

    it('should trim player names', () => {
      const { result } = renderHook(() => useWaitingRoom(VALID_ROOM_ID));

      act(() => {
        result.current.addPlayer('  Bob  ');
      });

      expect(result.current.players[0].name).toBe('Bob');
    });

    it('should not affect other rooms', () => {
      const OTHER_ROOM_ID = 'A2StGXR8_Z5jdHi6B-xyz';
      const { result } = renderHook(() => useWaitingRoom(VALID_ROOM_ID));
      const { result: otherResult } = renderHook(() => useWaitingRoom(OTHER_ROOM_ID));

      act(() => {
        result.current.addPlayer('Alice');
      });

      expect(result.current.players).toHaveLength(1);
      expect(otherResult.current.players).toHaveLength(0);
    });
  });

  describe('removePlayer', () => {
    it('should remove a player by id', () => {
      const { result } = renderHook(() => useWaitingRoom(VALID_ROOM_ID));

      act(() => {
        result.current.addPlayer('Alice');
      });
      const playerId = result.current.players[0].id;

      act(() => {
        result.current.removePlayer(playerId);
      });

      expect(result.current.players).toHaveLength(0);
    });
  });

  describe('togglePriority', () => {
    it('should toggle player priority', () => {
      const { result } = renderHook(() => useWaitingRoom(VALID_ROOM_ID));

      act(() => {
        result.current.addPlayer('Alice');
      });
      const playerId = result.current.players[0].id;

      act(() => {
        result.current.togglePriority(playerId);
      });
      expect(result.current.players[0].priority).toBe(true);

      act(() => {
        result.current.togglePriority(playerId);
      });
      expect(result.current.players[0].priority).toBe(false);
    });
  });

  describe('reorderPlayers', () => {
    it('should move a player from one index to another', () => {
      const { result } = renderHook(() => useWaitingRoom(VALID_ROOM_ID));

      act(() => {
        result.current.addPlayer('Alice');
        result.current.addPlayer('Bob');
        result.current.addPlayer('Charlie');
      });

      act(() => {
        result.current.reorderPlayers(0, 2);
      });

      const names = result.current.players.map((p) => p.name);
      expect(names).toEqual(['Bob', 'Charlie', 'Alice']);
    });
  });

  describe('clearWaitingRoom', () => {
    it('should remove all players from the room', () => {
      const { result } = renderHook(() => useWaitingRoom(VALID_ROOM_ID));

      act(() => {
        result.current.addPlayer('Alice');
        result.current.addPlayer('Bob');
      });
      expect(result.current.players).toHaveLength(2);

      act(() => {
        result.current.clearWaitingRoom();
      });

      expect(result.current.players).toHaveLength(0);
    });
  });

  describe('createGameFromWaitingRoom', () => {
    it('should create a game with the same roomId and copy players', () => {
      const { result } = renderHook(() => useWaitingRoom(VALID_ROOM_ID));

      act(() => {
        result.current.addPlayer('Alice');
        result.current.addPlayer('Bob');
        result.current.createGameFromWaitingRoom();
      });

      const game = useGameStore.getState().games[VALID_ROOM_ID];
      expect(game).toBeDefined();
      expect(game.players).toHaveLength(2);
      expect(game.players.map((p) => p.name)).toEqual(['Alice', 'Bob']);
    });
  });
});
