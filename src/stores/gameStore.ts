import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Player, Team, GameStatus } from '../types';

interface GameState {
  // State
  players: Player[];
  teams: Team[];
  teamCount: number;
  gameStatus: GameStatus;

  // Actions
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  togglePriority: (playerId: string) => void;
  setTeamCount: (count: number) => void;
  sortTeams: () => void;
  reset: () => void;
}

const initialState = {
  players: [] as Player[],
  teams: [] as Team[],
  teamCount: 2,
  gameStatus: 'setup' as GameStatus,
};

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        addPlayer: (name: string) => {
          const newPlayer: Player = {
            id: crypto.randomUUID(),
            name: name.trim(),
            timestamp: new Date(),
            priority: false,
          };

          set(
            (state) => ({
              players: [...state.players, newPlayer],
            }),
            false,
            'addPlayer'
          );
        },

        removePlayer: (playerId: string) => {
          set(
            (state) => ({
              players: state.players.filter((p) => p.id !== playerId),
              teams: state.teams.map((team) => ({
                ...team,
                players: team.players.filter((p) => p.id !== playerId),
              })),
            }),
            false,
            'removePlayer'
          );
        },

        togglePriority: (playerId: string) => {
          set(
            (state) => ({
              players: state.players.map((player) =>
                player.id === playerId
                  ? { ...player, priority: !player.priority }
                  : player
              ),
            }),
            false,
            'togglePriority'
          );
        },

        setTeamCount: (count: number) => {
          const validCount = Math.max(2, Math.min(10, Math.round(count)));

          set(
            () => ({
              teamCount: validCount,
            }),
            false,
            'setTeamCount'
          );
        },

        sortTeams: () => {
          const currentState = get();

          set(
            () => ({
              gameStatus: 'sorting' as GameStatus,
            }),
            false,
            'sortTeams/start'
          );

          // Sorting algorithm: distribute players evenly across teams
          // Priority players are distributed first, then others
          const sortedPlayers = [...currentState.players].sort((a, b) => {
            if (a.priority && !b.priority) return -1;
            if (!a.priority && b.priority) return 1;
            return 0;
          });

          const teams: Team[] = Array.from(
            { length: currentState.teamCount },
            (_, i) => ({
              id: crypto.randomUUID(),
              name: `Team ${i + 1}`,
              players: [],
            })
          );

          // Distribute players round-robin style
          sortedPlayers.forEach((player, index) => {
            const teamIndex = index % currentState.teamCount;
            teams[teamIndex].players.push(player);
          });

          // Update state with sorted teams and complete status
          set(
            () => ({
              teams,
              gameStatus: 'complete' as GameStatus,
            }),
            false,
            'sortTeams/complete'
          );
        },

        reset: () => {
          set(initialState, false, 'reset');
        },
      }),
      {
        name: 'futmeet-game-storage',
        partialize: (state) => ({
          players: state.players,
          teamCount: state.teamCount,
        }),
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.warn('Failed to rehydrate game store:', error);
            return;
          }

          if (state?.players) {
            // Convert timestamp strings back to Date objects
            state.players = state.players.map((player) => ({
              ...player,
              timestamp:
                player.timestamp instanceof Date
                  ? player.timestamp
                  : new Date(player.timestamp),
            }));
          }
        },
      }
    ),
    { name: 'GameStore' }
  )
);
