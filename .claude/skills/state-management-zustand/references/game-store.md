# Complete Game Store

```typescript
// stores/gameStore.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface GameState {
  players: Player[];
  priorityPlayers: string[];
  teamCount: number;
  gameStatus: 'setup' | 'sorting' | 'complete';
  teams: Team[];
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setPriority: (playerId: string) => void;
  sortTeams: (teamCount: number) => void;
  reset: () => void;
}

const initialState = {
  players: [],
  priorityPlayers: [],
  teamCount: 2,
  gameStatus: 'setup' as const,
  teams: [],
};

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        addPlayer: (player) =>
          set((state) => ({ players: [...state.players, player] })),

        removePlayer: (playerId) =>
          set((state) => ({
            players: state.players.filter((p) => p.id !== playerId),
            priorityPlayers: state.priorityPlayers.filter((id) => id !== playerId),
          })),

        setPriority: (playerId) =>
          set((state) => ({
            priorityPlayers: state.priorityPlayers.includes(playerId)
              ? state.priorityPlayers.filter((id) => id !== playerId)
              : [...state.priorityPlayers, playerId],
          })),

        sortTeams: (teamCount) => {
          set({ teams: sortedTeams, gameStatus: 'complete', teamCount });
        },

        reset: () => set(initialState),
      }),
      {
        name: 'futmeet-game-storage',
        partialize: (state) => ({
          players: state.players,
          priorityPlayers: state.priorityPlayers,
          teamCount: state.teamCount,
          gameStatus: state.gameStatus,
        }),
      }
    ),
    { name: 'GameStore' }
  )
);
```

## Component usage

```typescript
const players = useGameStore((state) => state.players);
const addPlayer = useGameStore((state) => state.addPlayer);
```
