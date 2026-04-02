---
name: state-management-zustand
description: Use when creating or modifying Zustand stores, adding localStorage persistence, handling state migrations, or wiring up store state in React components.
---

# State Management with Zustand

Use Zustand for all client state. TanStack Query handles server/API state — do not duplicate API data in Zustand stores.

Install: `npm install zustand` (persist middleware is included)

## Store Pattern

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
          // sorting logic here
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
          // Don't persist teams — recalculate on load
        }),
      }
    ),
    { name: 'GameStore' }
  )
);
```

## Component Usage

```typescript
import { useGameStore } from '@/stores/gameStore';

function PlayerList() {
  // Select only what you need — prevents unnecessary re-renders
  const players = useGameStore((state) => state.players);
  const addPlayer = useGameStore((state) => state.addPlayer);
}
```

## What to Persist

**Persist:** `players`, `priorityPlayers`, `teamCount`, `gameStatus`

**Do not persist:** UI state (modals, selections) — use component state; form data — use React Hook Form; cache — use TanStack Query

## Storage Error Handling

```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    name: 'futmeet-game-storage',
    onRehydrateStorage: () => (state, error) => {
      if (error) console.warn('Failed to persist state:', error);
    },
  }
);
```

## Data Migration

Increment `version` whenever the persisted state shape changes:

```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    name: 'futmeet-game-storage',
    version: 1,
    migrate: (persistedState: any, version: number) => {
      if (version === 0) {
        return { ...persistedState, /* apply migration */ };
      }
      return persistedState;
    },
  }
);
```

## Best Practices

- Always use selector functions — `useGameStore((state) => state.players)` not destructuring the whole store
- Define a `TypeScript` interface for every store
- Name actions with clear verbs: `addPlayer`, `removePlayer` — not `setPlayers`
- Always return new objects/arrays in setters — never mutate
- Place stores in `src/stores/` directory
