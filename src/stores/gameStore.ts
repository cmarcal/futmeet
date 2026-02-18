import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Player, Team, GameStatus } from '../types';
import { sortTeams as sortTeamsUtil } from '../utils/teamSorter';

export interface GameData {
  players: Player[];
  teams: Team[];
  teamCount: number;
  gameStatus: GameStatus;
}

interface GamesState {
  games: Record<string, GameData>;
  waitingRooms: Record<string, Player[]>;

  initGame: (gameId: string) => void;
  addPlayer: (gameId: string, name: string) => void;
  removePlayer: (gameId: string, playerId: string) => void;
  togglePriority: (gameId: string, playerId: string) => void;
  reorderPlayers: (gameId: string, fromIndex: number, toIndex: number) => void;
  setTeamCount: (gameId: string, count: number) => void;
  sortTeams: (gameId: string) => void;

  initWaitingRoom: (roomId: string) => void;
  addWaitingRoomPlayer: (roomId: string, name: string) => void;
  removeWaitingRoomPlayer: (roomId: string, playerId: string) => void;
  toggleWaitingRoomPriority: (roomId: string, playerId: string) => void;
  reorderWaitingRoomPlayers: (roomId: string, fromIndex: number, toIndex: number) => void;
  clearWaitingRoom: (roomId: string) => void;
  createGameFromWaitingRoom: (roomId: string) => void;
}

export const initialGameData: GameData = {
  players: [],
  teams: [],
  teamCount: 2,
  gameStatus: 'setup',
};

const createPlayer = (name: string): Player => ({
  id: crypto.randomUUID(),
  name: name.trim(),
  timestamp: new Date(),
  priority: false,
});

const validateTeamCount = (count: number): number => {
  return Math.max(2, Math.min(10, Math.round(count)));
};

const updateGame = (
  games: Record<string, GameData>,
  gameId: string,
  updater: (game: GameData) => Partial<GameData>
): Record<string, GameData> => {
  const game = games[gameId];
  if (!game) return games;
  return {
    ...games,
    [gameId]: { ...game, ...updater(game) },
  };
};

export const useGameStore = create<GamesState>()(
  devtools(
    persist(
      (set, get) => ({
        games: {},
        waitingRooms: {},

        initGame: (gameId: string) => {
          set(
            (state) => {
              if (state.games[gameId]) return state;
              return {
                games: {
                  ...state.games,
                  [gameId]: { ...initialGameData },
                },
              };
            },
            false,
            'initGame'
          );
        },

        addPlayer: (gameId: string, name: string) => {
          const newPlayer = createPlayer(name);
          set(
            (state) => ({
              games: updateGame(state.games, gameId, (game) => ({
                players: [...game.players, newPlayer],
              })),
            }),
            false,
            'addPlayer'
          );
        },

        removePlayer: (gameId: string, playerId: string) => {
          set(
            (state) => ({
              games: updateGame(state.games, gameId, (game) => ({
                players: game.players.filter((p) => p.id !== playerId),
                teams: game.teams.map((team) => ({
                  ...team,
                  players: team.players.filter((p) => p.id !== playerId),
                })),
              })),
            }),
            false,
            'removePlayer'
          );
        },

        togglePriority: (gameId: string, playerId: string) => {
          set(
            (state) => ({
              games: updateGame(state.games, gameId, (game) => ({
                players: game.players.map((player) =>
                  player.id === playerId ? { ...player, priority: !player.priority } : player
                ),
              })),
            }),
            false,
            'togglePriority'
          );
        },

        reorderPlayers: (gameId: string, fromIndex: number, toIndex: number) => {
          set(
            (state) => ({
              games: updateGame(state.games, gameId, (game) => {
                const newPlayers = [...game.players];
                const [movedPlayer] = newPlayers.splice(fromIndex, 1);
                newPlayers.splice(toIndex, 0, movedPlayer);
                return { players: newPlayers };
              }),
            }),
            false,
            'reorderPlayers'
          );
        },

        setTeamCount: (gameId: string, count: number) => {
          const validCount = validateTeamCount(count);
          set(
            (state) => ({
              games: updateGame(state.games, gameId, () => ({
                teamCount: validCount,
              })),
            }),
            false,
            'setTeamCount'
          );
        },

        initWaitingRoom: (roomId: string) => {
          set(
            (state) => {
              if (state.waitingRooms[roomId]) return state;
              return { waitingRooms: { ...state.waitingRooms, [roomId]: [] } };
            },
            false,
            'initWaitingRoom'
          );
        },

        addWaitingRoomPlayer: (roomId: string, name: string) => {
          const newPlayer = createPlayer(name);
          set(
            (state) => ({
              waitingRooms: {
                ...state.waitingRooms,
                [roomId]: [...(state.waitingRooms[roomId] ?? []), newPlayer],
              },
            }),
            false,
            'addWaitingRoomPlayer'
          );
        },

        removeWaitingRoomPlayer: (roomId: string, playerId: string) => {
          set(
            (state) => ({
              waitingRooms: {
                ...state.waitingRooms,
                [roomId]: (state.waitingRooms[roomId] ?? []).filter((p) => p.id !== playerId),
              },
            }),
            false,
            'removeWaitingRoomPlayer'
          );
        },

        toggleWaitingRoomPriority: (roomId: string, playerId: string) => {
          set(
            (state) => ({
              waitingRooms: {
                ...state.waitingRooms,
                [roomId]: (state.waitingRooms[roomId] ?? []).map((p) =>
                  p.id === playerId ? { ...p, priority: !p.priority } : p
                ),
              },
            }),
            false,
            'toggleWaitingRoomPriority'
          );
        },

        reorderWaitingRoomPlayers: (roomId: string, fromIndex: number, toIndex: number) => {
          set(
            (state) => {
              const newPlayers = [...(state.waitingRooms[roomId] ?? [])];
              const [moved] = newPlayers.splice(fromIndex, 1);
              newPlayers.splice(toIndex, 0, moved);
              return { waitingRooms: { ...state.waitingRooms, [roomId]: newPlayers } };
            },
            false,
            'reorderWaitingRoomPlayers'
          );
        },

        clearWaitingRoom: (roomId: string) => {
          set(
            (state) => ({ waitingRooms: { ...state.waitingRooms, [roomId]: [] } }),
            false,
            'clearWaitingRoom'
          );
        },

        createGameFromWaitingRoom: (roomId: string) => {
          const players = (get().waitingRooms[roomId] ?? []).map((p) => ({ ...p, timestamp: new Date() }));
          set(
            (state) => ({
              games: { ...state.games, [roomId]: { ...initialGameData, players } },
            }),
            false,
            'createGameFromWaitingRoom'
          );
        },

        sortTeams: (gameId: string) => {
          const game = get().games[gameId];
          if (!game) return;

          const validTeamCount = validateTeamCount(game.teamCount);

          set(
            (state) => ({
              games: updateGame(state.games, gameId, () => ({
                gameStatus: 'sorting' as GameStatus,
              })),
            }),
            false,
            'sortTeams/start'
          );

          const teams = sortTeamsUtil(game.players, validTeamCount);

          set(
            (state) => ({
              games: updateGame(state.games, gameId, () => ({
                teams,
                gameStatus: 'complete' as GameStatus,
              })),
            }),
            false,
            'sortTeams/complete'
          );
        },
      }),
      {
        name: 'futmeet-games-storage',
        partialize: (state) => ({
          games: state.games,
          waitingRooms: state.waitingRooms,
        }),
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.warn('Failed to rehydrate games store:', error);
            return;
          }

          if (state) {
            const fixTimestamp = (player: Player): Player => ({
              ...player,
              timestamp: player.timestamp instanceof Date ? player.timestamp : new Date(player.timestamp),
            });

            if (state.waitingRooms) {
              Object.keys(state.waitingRooms).forEach((roomId) => {
                state.waitingRooms[roomId] = state.waitingRooms[roomId].map(fixTimestamp);
              });
            }

            Object.keys(state.games).forEach((gameId) => {
              const game = state.games[gameId];
              game.teamCount = validateTeamCount(game.teamCount);

              if (game.players) {
                game.players = game.players.map(fixTimestamp);
              }

              if (game.teams) {
                game.teams = game.teams.map((team) => ({
                  ...team,
                  players: team.players.map(fixTimestamp),
                }));
              }
            });
          }
        },
      }
    ),
    { name: 'GameStore' }
  )
);
