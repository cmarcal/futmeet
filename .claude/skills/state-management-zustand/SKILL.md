---
name: state-management-zustand
description: Use when creating or modifying Zustand stores, localStorage persistence, or store migrations.
---

# State Management with Zustand

Zustand owns client state. TanStack Query owns server/API state (`api-tanstack-query` skill); never duplicate API data in a store.

## Rules

- Stores live in `src/stores/`, each with a TypeScript interface
- Components read through selectors: `useGameStore((state) => state.players)`, never by destructuring the whole store
- Actions are named with clear verbs (`addPlayer`, `removePlayer`), not `setPlayers`
- Setters return new objects/arrays; never mutate
- Compose `devtools(persist(...))`; persist via `partialize`
- Increment `version` and add a `migrate` branch whenever the persisted shape changes

## What to Persist

Persist: `players`, `priorityPlayers`, `teamCount`, `gameStatus`.

Keep out of the store: UI state (modals, selections) in component state; form data in React Hook Form; cache in TanStack Query. Derived data such as `teams` is recalculated on load.

## Store Shape

```typescript
export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        addPlayer: (player) => set((state) => ({ players: [...state.players, player] })),
        reset: () => set(initialState),
      }),
      {
        name: 'futmeet-game-storage',
        version: 1,
        partialize: (state) => ({ players: state.players, teamCount: state.teamCount }),
      }
    ),
    { name: 'GameStore' }
  )
);
```

## Migration

```typescript
migrate: (persistedState: any, version: number) => {
  if (version === 0) return { ...persistedState /* apply migration */ };
  return persistedState;
},
```

## Storage Errors

```typescript
onRehydrateStorage: () => (state, error) => {
  if (error) console.warn('Failed to persist state:', error);
},
```

## References

Read `references/game-store.md` for the complete game store with every action.
