---
name: api-tanstack-query
description: Use when implementing API calls, server state management, caching, or mutations in the web app. Covers TanStack Query setup, custom hooks, mock APIs for MVP, and integration with Zustand.
---

# API Integration with TanStack Query

Use TanStack Query (React Query) for all server state. Use Zustand for client/UI state only.

Install: `npm install @tanstack/react-query`

## QueryClient Configuration

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

```typescript
// App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* app */}
    </QueryClientProvider>
  );
}
```

## Query Hook

```typescript
// hooks/api/usePlayers.ts
import { useQuery } from '@tanstack/react-query';
import { playersAPI } from '@/api/players';

export function usePlayers(gameId: string) {
  return useQuery({
    queryKey: ['players', gameId],
    queryFn: () => playersAPI.fetchPlayers(gameId),
    staleTime: 5000,
  });
}

// Component usage
const { data: players, isLoading, error } = usePlayers(gameId);
```

## Mutation Hook

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
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
}

// Component usage
const { mutate: addPlayer, isPending } = useAddPlayer();
addPlayer(data, { onSuccess: () => {...}, onError: (err) => {...} });
```

## API Service Layer

```
src/api/
├── players.ts
├── teams.ts
└── mock/
    ├── players.ts
    └── teams.ts
```

```typescript
// api/players.ts
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
    const response = await fetch(`/api/players/${playerId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to remove player');
  },
};
```

## Mock API for MVP

```typescript
// api/mock/players.ts
export const mockPlayersAPI = {
  fetchPlayers: async (gameId: string): Promise<Player[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem(`players-${gameId}`);
    return stored ? JSON.parse(stored) : [];
  },
  addPlayer: async (input: AddPlayerInput): Promise<Player> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newPlayer: Player = { id: crypto.randomUUID(), ...input, timestamp: new Date() };
    const players = await mockPlayersAPI.fetchPlayers('default');
    localStorage.setItem('players-default', JSON.stringify([...players, newPlayer]));
    return newPlayer;
  },
  removePlayer: async (playerId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const players = await mockPlayersAPI.fetchPlayers('default');
    localStorage.setItem('players-default', JSON.stringify(players.filter(p => p.id !== playerId)));
  },
};

// Switch between mock and real
const USE_MOCK = import.meta.env.DEV;
export const playersAPI = USE_MOCK ? mockPlayersAPI : realPlayersAPI;
```

## Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: addPlayerAPI,
  onMutate: async (newPlayer) => {
    await queryClient.cancelQueries({ queryKey: ['players'] });
    const previousPlayers = queryClient.getQueryData<Player[]>(['players']);
    queryClient.setQueryData(['players'], (old: Player[] = []) => [...old, newPlayer]);
    return { previousPlayers };
  },
  onError: (err, newPlayer, context) => {
    if (context?.previousPlayers) {
      queryClient.setQueryData(['players'], context.previousPlayers);
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['players'] });
  },
});
```

## Polling

```typescript
const { data } = useQuery({
  queryKey: ['players'],
  queryFn: fetchPlayers,
  refetchInterval: 5000,
});
```

## Sync with Zustand

```typescript
const { data: serverPlayers } = usePlayers(gameId);
const { setPlayers } = useGameStore();

useEffect(() => {
  if (serverPlayers) setPlayers(serverPlayers);
}, [serverPlayers, setPlayers]);
```

## Best Practices

- Use hierarchical query keys: `['players', gameId]`, `['player', playerId]`
- Create one custom hook per query/mutation — never call `useQuery` directly in components
- Always handle `isLoading` and `error` states in components
- Type all API functions and hook return values
