import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Player, Team, GameStatus } from '../types';
import { sortTeams as sortTeamsUtil } from '../utils/teamSorter';

interface GameState {
  players: Player[];
  teams: Team[];
  teamCount: number;
  gameStatus: GameStatus;
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

const createPlayer = (name: string): Player => ({
  id: crypto.randomUUID(),
  name: name.trim(),
  timestamp: new Date(),
  priority: false,
});

const validateTeamCount = (count: number): number => {
  return Math.max(2, Math.min(10, Math.round(count)));
};

const filterPlayerById = (players: Player[], playerId: string): Player[] => {
  return players.filter((p) => p.id !== playerId);
};

const togglePlayerPriority = (players: Player[], playerId: string): Player[] => {
  return players.map((player) => (player.id === playerId ? { ...player, priority: !player.priority } : player));
};

const removePlayerFromTeams = (teams: Team[], playerId: string): Team[] => {
  return teams.map((team) => ({
    ...team,
    players: team.players.filter((p) => p.id !== playerId),
  }));
};

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        addPlayer: (name: string) => {
          const newPlayer = createPlayer(name);
          set((state) => ({ players: [...state.players, newPlayer] }), false, 'addPlayer');
        },

        removePlayer: (playerId: string) => {
          set(
            (state) => ({
              players: filterPlayerById(state.players, playerId),
              teams: removePlayerFromTeams(state.teams, playerId),
            }),
            false,
            'removePlayer'
          );
        },

        togglePriority: (playerId: string) => {
          set((state) => ({ players: togglePlayerPriority(state.players, playerId) }), false, 'togglePriority');
        },

        setTeamCount: (count: number) => {
          const validCount = validateTeamCount(count);
          set(() => ({ teamCount: validCount }), false, 'setTeamCount');
        },

        sortTeams: () => {
          const { players, teamCount } = get();
          const validTeamCount = validateTeamCount(teamCount);

          set(() => ({ gameStatus: 'sorting' as GameStatus }), false, 'sortTeams/start');

          const teams = sortTeamsUtil(players, validTeamCount);

          set(() => ({ teams, gameStatus: 'complete' as GameStatus }), false, 'sortTeams/complete');
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

          if (state) {
            state.teamCount = validateTeamCount(state.teamCount);

            if (state.players) {
              state.players = state.players.map((player) => ({
                ...player,
                timestamp: player.timestamp instanceof Date ? player.timestamp : new Date(player.timestamp),
              }));
            }
          }
        },
      }
    ),
    { name: 'GameStore' }
  )
);
