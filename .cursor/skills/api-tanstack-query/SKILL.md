---
name: api-tanstack-query
description: Use TanStack Query (React Query) for API integration and server state management. This skill guides implementing API calls, caching, and mutations following the project's architecture.
---

# API Integration with TanStack Query

When working with API calls and server state in this project, use TanStack Query (React Query). This provides automatic caching, background updates, and simplified data fetching.

## When to Use This Skill

- Fetching data from APIs
- Creating mutations (POST, PUT, DELETE)
- Managing server state and caching
- Setting up mock APIs for MVP
- Migrating from mocks to real APIs

## Key Principles

1. **TanStack Query** handles server state (API data, caching, synchronization)
2. **Zustand** handles client state (UI state, local game data)
3. **Mock APIs First**: Start with mocks, migrate to real APIs later
4. **Custom Hooks**: Create custom hooks for queries/mutations
5. **Type Safety**: Full TypeScript support

## Setup

### Install Dependencies

```bash
npm install @tanstack/react-query
npm install -D @tanstack/react-query-devtools  # Optional, for development
```

### Configure QueryClient

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Disable refetch on window focus
    },
  },
});
```

### Add Provider to App

```typescript
// App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## Basic Patterns

### Fetching Data (Query)

```typescript
// hooks/api/usePlayers.ts
import { useQuery } from '@tanstack/react-query';
import { playersAPI } from '@/api/players';

export function usePlayers(gameId: string) {
  return useQuery({
    queryKey: ['players', gameId],
    queryFn: () => playersAPI.fetchPlayers(gameId),
    staleTime: 5000, // Consider data fresh for 5 seconds
  });
}

// Component usage
function PlayerList({ gameId }: { gameId: string }) {
  const { data: players, isLoading, error } = usePlayers(gameId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {players?.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}
```

### Mutating Data (Mutation)

```typescript
// hooks/api/useAddPlayer.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { playersAPI } from '@/api/players';
import type { AddPlayerInput } from '@/schemas/playerSchemas';

export function useAddPlayer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (player: AddPlayerInput) => playersAPI.addPlayer(player),
    onSuccess: () => {
      // Invalidate and refetch players list
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
}

// Component usage
function PlayerInput() {
  const { mutate: addPlayer, isPending } = useAddPlayer();
  
  const handleSubmit = (data: AddPlayerInput) => {
    addPlayer(data, {
      onSuccess: () => {
        console.log('Player added successfully');
      },
      onError: (error) => {
        console.error('Failed to add player:', error);
      },
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Adding...' : 'Add Player'}
      </button>
    </form>
  );
}
```

## API Service Layer

### Structure

```
src/
├── api/
│   ├── players.ts      # Player API functions
│   ├── teams.ts        # Team API functions
│   └── mock/           # Mock API implementations (MVP)
│       ├── players.ts
│       └── teams.ts
```

### API Service Pattern

```typescript
// api/players.ts
import type { Player, AddPlayerInput } from '@/types';

export const playersAPI = {
  fetchPlayers: async (gameId: string): Promise<Player[]> => {
    const response = await fetch(`/api/games/${gameId}/players`);
    if (!response.ok) throw new Error('Failed to fetch players');
    return response.json();
  },
  
  addPlayer: async (input: AddPlayerInput): Promise<Player> => {
    const response = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error('Failed to add player');
    return response.json();
  },
  
  removePlayer: async (playerId: string): Promise<void> => {
    const response = await fetch(`/api/players/${playerId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove player');
  },
};
```

## Mock APIs for MVP

### Mock Implementation

```typescript
// api/mock/players.ts
import type { Player, AddPlayerInput } from '@/types';

export const mockPlayersAPI = {
  fetchPlayers: async (gameId: string): Promise<Player[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Read from localStorage or return mock data
    const stored = localStorage.getItem(`players-${gameId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  },
  
  addPlayer: async (input: AddPlayerInput): Promise<Player> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      ...input,
      timestamp: new Date(),
    };
    
    const gameId = 'default'; // Or get from context
    const players = await mockPlayersAPI.fetchPlayers(gameId);
    const updatedPlayers = [...players, newPlayer];
    
    localStorage.setItem(`players-${gameId}`, JSON.stringify(updatedPlayers));
    return newPlayer;
  },
  
  removePlayer: async (playerId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const gameId = 'default';
    const players = await mockPlayersAPI.fetchPlayers(gameId);
    const filtered = players.filter(p => p.id !== playerId);
    
    localStorage.setItem(`players-${gameId}`, JSON.stringify(filtered));
  },
};
```

### Switch Between Mock and Real API

```typescript
// api/players.ts
const USE_MOCK = import.meta.env.DEV; // Use mock in development

export const playersAPI = USE_MOCK
  ? mockPlayersAPI
  : realPlayersAPI;
```

## Advanced Patterns

### Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: addPlayerAPI,
  onMutate: async (newPlayer) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['players'] });
    
    // Snapshot previous value
    const previousPlayers = queryClient.getQueryData<Player[]>(['players']);
    
    // Optimistically update
    queryClient.setQueryData(['players'], (old: Player[] = []) => [...old, newPlayer]);
    
    return { previousPlayers };
  },
  onError: (err, newPlayer, context) => {
    // Rollback on error
    if (context?.previousPlayers) {
      queryClient.setQueryData(['players'], context.previousPlayers);
    }
  },
  onSettled: () => {
    // Refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['players'] });
  },
});
```

### Polling / Real-time Updates

```typescript
// Polling - refetch every 5 seconds
const { data } = useQuery({
  queryKey: ['players'],
  queryFn: fetchPlayers,
  refetchInterval: 5000,
});
```

## Integration with State Management

### TanStack Query + Zustand

**TanStack Query** for:
- Server state (API data)
- Caching and synchronization

**Zustand** for:
- Client state (UI state, local game data)
- Player list (before API sync)
- Team sorting results

### Sync Pattern

```typescript
// Sync server data with local store when needed
const { data: serverPlayers } = usePlayers(gameId);
const { setPlayers } = useGameStore();

useEffect(() => {
  if (serverPlayers) {
    setPlayers(serverPlayers);
  }
}, [serverPlayers, setPlayers]);
```

## Best Practices

1. **Query Keys**: Use consistent, hierarchical query keys
   ```typescript
   ['players', gameId]
   ['teams', gameId]
   ['player', playerId]
   ```

2. **Custom Hooks**: Create hooks for each query/mutation
3. **Error Handling**: Handle errors in components and mutations
4. **Loading States**: Use `isLoading`, `isPending` for UI feedback
5. **Type Safety**: Type all API functions and hooks

## Related Files

- `adr/frontend/01-frontend-architecture/tanstack-query-integration.md` - Full integration documentation
- `adr/frontend/01-frontend-architecture/final-decisions.md` - Architecture decisions

## Checklist

- [ ] Install `@tanstack/react-query`
- [ ] Set up QueryClientProvider in App
- [ ] Create API service layer structure
- [ ] Create mock API implementations (MVP)
- [ ] Create custom hooks for queries/mutations
- [ ] Add TanStack Query DevTools (development)
- [ ] Integrate with forms (mutations)
