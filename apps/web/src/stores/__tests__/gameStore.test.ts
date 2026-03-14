import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../gameStore';

const GAME_ID = 'V1StGXR8_Z5jdHi6B-myT';

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.setState({ games: {}, waitingRooms: {} });
  });

  describe('initGame', () => {
    it('should create a new game with initial data', () => {
      useGameStore.getState().initGame(GAME_ID);
      const game = useGameStore.getState().games[GAME_ID];
      expect(game).toBeDefined();
      expect(game.players).toEqual([]);
      expect(game.teamCount).toBe(2);
      expect(game.gameStatus).toBe('setup');
    });

    it('should not overwrite an existing game', () => {
      useGameStore.getState().initGame(GAME_ID);
      useGameStore.getState().addPlayer(GAME_ID, 'Alice');
      useGameStore.getState().initGame(GAME_ID);
      const game = useGameStore.getState().games[GAME_ID];
      expect(game.players).toHaveLength(1);
    });
  });

  describe('addPlayer', () => {
    it('should add a player to the game', () => {
      useGameStore.getState().initGame(GAME_ID);
      useGameStore.getState().addPlayer(GAME_ID, 'Alice');
      const game = useGameStore.getState().games[GAME_ID];
      expect(game.players).toHaveLength(1);
      expect(game.players[0].name).toBe('Alice');
      expect(game.players[0].priority).toBe(false);
      expect(game.players[0].id).toBeTruthy();
    });

    it('should trim player names', () => {
      useGameStore.getState().initGame(GAME_ID);
      useGameStore.getState().addPlayer(GAME_ID, '  Bob  ');
      const game = useGameStore.getState().games[GAME_ID];
      expect(game.players[0].name).toBe('Bob');
    });

    it('should not affect other games', () => {
      const OTHER_ID = 'A2StGXR8_Z5jdHi6B-xyz';
      useGameStore.getState().initGame(GAME_ID);
      useGameStore.getState().initGame(OTHER_ID);
      useGameStore.getState().addPlayer(GAME_ID, 'Alice');
      expect(useGameStore.getState().games[OTHER_ID].players).toHaveLength(0);
    });
  });

  describe('removePlayer', () => {
    it('should remove a player by id', () => {
      useGameStore.getState().initGame(GAME_ID);
      useGameStore.getState().addPlayer(GAME_ID, 'Alice');
      const playerId = useGameStore.getState().games[GAME_ID].players[0].id;
      useGameStore.getState().removePlayer(GAME_ID, playerId);
      expect(useGameStore.getState().games[GAME_ID].players).toHaveLength(0);
    });
  });

  describe('togglePriority', () => {
    it('should toggle player priority', () => {
      useGameStore.getState().initGame(GAME_ID);
      useGameStore.getState().addPlayer(GAME_ID, 'Alice');
      const playerId = useGameStore.getState().games[GAME_ID].players[0].id;
      useGameStore.getState().togglePriority(GAME_ID, playerId);
      expect(useGameStore.getState().games[GAME_ID].players[0].priority).toBe(true);
      useGameStore.getState().togglePriority(GAME_ID, playerId);
      expect(useGameStore.getState().games[GAME_ID].players[0].priority).toBe(false);
    });
  });

  describe('reorderPlayers', () => {
    it('should move a player from one index to another', () => {
      useGameStore.getState().initGame(GAME_ID);
      useGameStore.getState().addPlayer(GAME_ID, 'Alice');
      useGameStore.getState().addPlayer(GAME_ID, 'Bob');
      useGameStore.getState().addPlayer(GAME_ID, 'Charlie');
      useGameStore.getState().reorderPlayers(GAME_ID, 0, 2);
      const names = useGameStore.getState().games[GAME_ID].players.map((p) => p.name);
      expect(names).toEqual(['Bob', 'Charlie', 'Alice']);
    });
  });

  describe('setTeamCount', () => {
    it('should update team count within valid range', () => {
      useGameStore.getState().initGame(GAME_ID);
      useGameStore.getState().setTeamCount(GAME_ID, 4);
      expect(useGameStore.getState().games[GAME_ID].teamCount).toBe(4);
    });

    it('should clamp to minimum of 2', () => {
      useGameStore.getState().initGame(GAME_ID);
      useGameStore.getState().setTeamCount(GAME_ID, 1);
      expect(useGameStore.getState().games[GAME_ID].teamCount).toBe(2);
    });

    it('should clamp to maximum of 10', () => {
      useGameStore.getState().initGame(GAME_ID);
      useGameStore.getState().setTeamCount(GAME_ID, 20);
      expect(useGameStore.getState().games[GAME_ID].teamCount).toBe(10);
    });
  });

  describe('sortTeams', () => {
    it('should sort players into teams and set status to complete', () => {
      useGameStore.getState().initGame(GAME_ID);
      useGameStore.getState().addPlayer(GAME_ID, 'Alice');
      useGameStore.getState().addPlayer(GAME_ID, 'Bob');
      useGameStore.getState().addPlayer(GAME_ID, 'Charlie');
      useGameStore.getState().addPlayer(GAME_ID, 'Dave');
      useGameStore.getState().sortTeams(GAME_ID);
      const game = useGameStore.getState().games[GAME_ID];
      expect(game.gameStatus).toBe('complete');
      expect(game.teams).toHaveLength(2);
      expect(game.teams[0].players.length + game.teams[1].players.length).toBe(4);
    });

    it('should do nothing if game does not exist', () => {
      expect(() => useGameStore.getState().sortTeams('non-existent-id123456')).not.toThrow();
    });
  });

  describe('waiting room', () => {
    const ROOM_ID = 'V1StGXR8_Z5jdHi6B-myT';

    describe('initWaitingRoom', () => {
      it('should create an empty waiting room', () => {
        useGameStore.getState().initWaitingRoom(ROOM_ID);
        const players = useGameStore.getState().waitingRooms[ROOM_ID];
        expect(players).toBeDefined();
        expect(players).toEqual([]);
      });

      it('should not overwrite an existing room', () => {
        useGameStore.getState().initWaitingRoom(ROOM_ID);
        useGameStore.getState().addWaitingRoomPlayer(ROOM_ID, 'Alice');
        useGameStore.getState().initWaitingRoom(ROOM_ID);
        const players = useGameStore.getState().waitingRooms[ROOM_ID];
        expect(players).toHaveLength(1);
      });
    });

    describe('addWaitingRoomPlayer', () => {
      it('should add a player to the waiting room', () => {
        useGameStore.getState().initWaitingRoom(ROOM_ID);
        useGameStore.getState().addWaitingRoomPlayer(ROOM_ID, 'Alice');
        const players = useGameStore.getState().waitingRooms[ROOM_ID];
        expect(players).toHaveLength(1);
        expect(players[0].name).toBe('Alice');
      });
    });

    describe('removeWaitingRoomPlayer', () => {
      it('should remove a player by id', () => {
        useGameStore.getState().initWaitingRoom(ROOM_ID);
        useGameStore.getState().addWaitingRoomPlayer(ROOM_ID, 'Alice');
        const playerId = useGameStore.getState().waitingRooms[ROOM_ID][0].id;
        useGameStore.getState().removeWaitingRoomPlayer(ROOM_ID, playerId);
        expect(useGameStore.getState().waitingRooms[ROOM_ID]).toHaveLength(0);
      });
    });

    describe('createGameFromWaitingRoom', () => {
      it('should create a game with the same roomId and copy players', () => {
        useGameStore.getState().initWaitingRoom(ROOM_ID);
        useGameStore.getState().addWaitingRoomPlayer(ROOM_ID, 'Alice');
        useGameStore.getState().addWaitingRoomPlayer(ROOM_ID, 'Bob');
        useGameStore.getState().createGameFromWaitingRoom(ROOM_ID);

        const game = useGameStore.getState().games[ROOM_ID];
        expect(game).toBeDefined();
        expect(game.players).toHaveLength(2);
        expect(game.players.map((p) => p.name)).toEqual(['Alice', 'Bob']);
      });
    });
  });
});
