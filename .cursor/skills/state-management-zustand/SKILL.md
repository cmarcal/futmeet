---
name: state-management-zustand
description: Use Zustand for state management with persist middleware for localStorage. This skill guides implementing Zustand stores following the project's architectural decisions.
---

# State Management with Zustand

When working with state management in this project, use Zustand as the primary solution. This skill provides guidance on implementing Zustand stores according to the architectural decisions documented in `adr/frontend/01-frontend-architecture/state-management-analysis.md`.

## When to Use This Skill

- Setting up new Zustand stores
- Adding state persistence with localStorage
- Implementing actions and state updates
- Handling state migrations
- Debugging state with Redux DevTools

## Key Principles

1. **Zustand from the Start**: We use Zustand from the beginning (not Context + useReducer)
2. **Persist Middleware**: Use Zustand's persist middleware for localStorage
3. **TypeScript First**: All stores must be fully typed
4. **Minimal Boilerplate**: Keep stores simple and focused
5. **Redux DevTools**: Enable DevTools for debugging

## Implementation Pattern

### Basic Store Structure

```typescript
// stores/gameStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  // State
  players: Player[];
  priorityPlayers: string[];
  teamCount: number;
  gameStatus: 'setup' | 'sorting' | 'complete';
  teams: Team[];
  
  // Actions
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
  persist(
    (set) => ({
      ...initialState,
      
      addPlayer: (player) =>
        set((state) => ({
          players: [...state.players, player],
        })),
      
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
        // Sorting logic here
        set({ teams: sortedTeams, gameStatus: 'complete', teamCount });
      },
      
      reset: () => set(initialState),
    }),
    {
      name: 'futmeet-game-storage', // localStorage key
      partialize: (state) => ({
        // Only persist specific fields
        players: state.players,
        priorityPlayers: state.priorityPlayers,
        teamCount: state.teamCount,
        gameStatus: state.gameStatus,
        // Don't persist teams (recalculate on load if needed)
      }),
    }
  )
);
```

### Using the Store in Components

```typescript
import { useGameStore } from '@/stores/gameStore';

function PlayerList() {
  // Select only what you need (prevents unnecessary re-renders)
  const players = useGameStore((state) => state.players);
  const addPlayer = useGameStore((state) => state.addPlayer);
  
  // Or use the entire store if needed
  // const { players, addPlayer } = useGameStore();
  
  return (
    <div>
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}
```

## Persistence Strategy

### What to Persist

**Persist:**
- `players` array (current player list)
- `priorityPlayers` array (IDs of priority players)
- `teamCount` (number of teams configuration)
- `gameStatus` (current game state)

**Don't Persist:**
- UI state (modals, selected items) - use component state instead
- Temporary form data - use React Hook Form state
- Cache - handled by TanStack Query

### Error Handling

```typescript
import { persist } from 'zustand/middleware';

const handleStorageError = (error: Error) => {
  console.warn('Failed to persist state:', error);
  // Optionally show user notification
  // Fallback: Continue without persistence
};

persist(
  (set) => ({ /* ... */ }),
  {
    name: 'futmeet-game-storage',
    onRehydrateStorage: () => (state, error) => {
      if (error) {
        handleStorageError(error);
      }
    },
  }
);
```

### Data Migration

When state shape changes, handle migrations:

```typescript
const migrateStorage = (persistedState: any, version: number) => {
  if (version === 0) {
    // Migrate from old format to new format
    return {
      ...persistedState,
      // Apply migrations
    };
  }
  return persistedState;
};

persist(
  (set) => ({ /* ... */ }),
  {
    name: 'futmeet-game-storage',
    version: 1, // Increment on schema changes
    migrate: migrateStorage,
  }
);
```

## Redux DevTools Integration

Enable DevTools in development:

```typescript
import { devtools } from 'zustand/middleware';

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set) => ({ /* ... */ }),
      { name: 'futmeet-game-storage' }
    ),
    { name: 'GameStore' }
  )
);
```

## Best Practices

1. **Selective Subscriptions**: Only subscribe to state you need to prevent re-renders
   ```typescript
   // ✅ Good - only re-renders when players change
   const players = useGameStore((state) => state.players);
   
   // ❌ Bad - re-renders on any state change
   const { players } = useGameStore();
   ```

2. **Type Safety**: Always define interfaces for store state
3. **Action Naming**: Use clear, action-oriented names (addPlayer, not setPlayers)
4. **Immutability**: Always return new objects/arrays in setters
5. **Store Location**: Place stores in `src/stores/` directory

## Related Files

- `adr/frontend/01-frontend-architecture/state-management-analysis.md` - Full analysis and rationale
- `adr/frontend/01-frontend-architecture/final-decisions.md` - Final decision summary

## Installation

```bash
npm install zustand
```

The persist middleware is included in the main zustand package.
