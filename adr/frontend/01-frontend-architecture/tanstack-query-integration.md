# TanStack Query (React Query) Integration

## Overview
TanStack Query as the primary framework for API connections and server state management.

---

## What is TanStack Query?

### Definition
Powerful data synchronization library for React (and other frameworks). Manages server state, caching, synchronization, and more.

### Key Concepts
- **Server State Management**: Fetches, caches, and synchronizes server data
- **Declarative Data Fetching**: Define data requirements, library handles the rest
- **Automatic Caching**: Intelligent caching with stale-while-revalidate pattern
- **Background Updates**: Keeps data fresh automatically
- **Optimistic Updates**: Update UI before server confirms

---

## Why TanStack Query for Your Project?

### Benefits ✅
1. **Simplifies API Calls**: No need to manage loading/error states manually
2. **Automatic Caching**: Reduces unnecessary API calls
3. **Background Refetching**: Keeps data fresh automatically
4. **Offline Support**: Works with cached data when offline
5. **TypeScript**: Excellent TypeScript support
6. **DevTools**: TanStack Query DevTools for debugging
7. **Popular & Maintained**: Widely adopted, active development

### Perfect For Your MVP
Even for an MVP without backend initially, TanStack Query helps:
- **Future-Proof**: Easy to add API calls later
- **Mocking**: Can mock API calls for development
- **Consistency**: Same patterns when you add real APIs
- **Testing**: Easy to test with mocked queries

---

## Architecture Integration

### Where It Fits

```
┌─────────────────────────────────────────┐
│         React Components                │
│  (UI Layer - PlayerInput, PlayerList)   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      TanStack Query Hooks               │
│  (useQuery, useMutation, useQueryClient)│
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      API Service Layer                  │
│  (api/players.ts, api/teams.ts)         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Backend API / Mock APIs            │
│  (Future: REST/GraphQL endpoints)       │
└─────────────────────────────────────────┘
```

### State Management Split

**TanStack Query** handles:
- Server state (API data)
- Caching
- Synchronization
- Background updates

**Context/Zustand** handles:
- Client state (UI state, local game data)
- Player list (before API)
- Team sorting results
- Local preferences

---

## Basic Usage Patterns

### 1. Fetching Data (Query)
```typescript
// hooks/usePlayers.ts
import { useQuery } from '@tanstack/react-query';

export function usePlayers(gameId: string) {
  return useQuery({
    queryKey: ['players', gameId],
    queryFn: () => fetchPlayers(gameId),
    staleTime: 5000, // Consider data fresh for 5 seconds
  });
}

// Component usage
function PlayerList({ gameId }: { gameId: string }) {
  const { data: players, isLoading, error } = usePlayers(gameId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{players.map(p => <PlayerCard key={p.id} player={p} />)}</div>;
}
```

### 2. Mutating Data (Mutation)
```typescript
// hooks/useAddPlayer.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useAddPlayer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (player: AddPlayerInput) => addPlayerAPI(player),
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
    addPlayer(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
      <button disabled={isPending}>
        {isPending ? 'Adding...' : 'Add Player'}
      </button>
    </form>
  );
}
```

### 3. Setup Provider
```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

---

## For MVP (Before Backend)

### Mock API Setup
```typescript
// api/mock/players.ts
export const mockPlayersAPI = {
  fetchPlayers: async (): Promise<Player[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return JSON.parse(localStorage.getItem('players') || '[]');
  },
  
  addPlayer: async (player: AddPlayerInput): Promise<Player> => {
    const players = await mockPlayersAPI.fetchPlayers();
    const newPlayer = { id: uuid(), ...player, createdAt: new Date() };
    localStorage.setItem('players', JSON.stringify([...players, newPlayer]));
    return newPlayer;
  },
};
```

### Easy Migration Path
When you add real backend:
```typescript
// api/players.ts
// Just swap the implementation
export const playersAPI = {
  fetchPlayers: async () => {
    const response = await fetch('/api/players');
    return response.json();
  },
  // ... rest stays the same
};
```

---

## Advanced Features (Future)

### 1. Optimistic Updates
```typescript
const mutation = useMutation({
  mutationFn: addPlayerAPI,
  onMutate: async (newPlayer) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['players'] });
    
    // Snapshot previous value
    const previousPlayers = queryClient.getQueryData(['players']);
    
    // Optimistically update
    queryClient.setQueryData(['players'], (old: Player[]) => [...old, newPlayer]);
    
    return { previousPlayers };
  },
  onError: (err, newPlayer, context) => {
    // Rollback on error
    queryClient.setQueryData(['players'], context.previousPlayers);
  },
});
```

### 2. Real-time Sync
```typescript
// Polling
useQuery({
  queryKey: ['players'],
  queryFn: fetchPlayers,
  refetchInterval: 5000, // Refetch every 5 seconds
});

// Or with WebSocket (when you add it)
```

---

## Integration with State Management

### Working Together: TanStack Query + Context/Zustand

**TanStack Query** for:
- API data (players from server, game sessions)
- Server state synchronization

**Context/Zustand** for:
- Local game state (current players list, teams, priority)
- UI state (modals, filters, selected items)
- Client-only data

### Example Pattern
```typescript
// Use TanStack Query for server state
const { data: serverPlayers } = usePlayers(gameId);

// Use Zustand for local game management
const { players, addPlayer, sortTeams } = useGameStore();

// Sync when needed
useEffect(() => {
  if (serverPlayers) {
    // Update local store from server
    syncPlayersFromServer(serverPlayers);
  }
}, [serverPlayers]);
```

---

## Installation & Setup

### Installation
```bash
npm install @tanstack/react-query
```

### Optional (Recommended)
```bash
npm install @tanstack/react-query-devtools  # For development
```

### Project Structure
```
src/
├── api/              # API service layer
│   ├── players.ts    # Player API functions
│   ├── teams.ts      # Team API functions
│   └── mock/         # Mock APIs for MVP
├── hooks/            # Custom hooks
│   ├── usePlayers.ts      # useQuery hook
│   ├── useAddPlayer.ts    # useMutation hook
│   └── useTeams.ts        # useQuery hook
└── lib/              # Configuration
    └── queryClient.ts     # QueryClient setup
```

---

## Decision Summary

✅ **Use TanStack Query for API integration**

**Benefits:**
- Future-proof architecture
- Handles loading/error states automatically
- Caching and performance optimization
- Easy to add real APIs later
- Can mock APIs for MVP phase

**Implementation Plan:**
1. Set up QueryClient provider in App
2. Create API service layer (mock initially)
3. Create custom hooks for queries/mutations
4. Integrate with form handling (React Hook Form)
5. Add real API endpoints when backend is ready

---

## Checklist

- [ ] Install `@tanstack/react-query`
- [ ] Set up QueryClientProvider in App
- [ ] Create API service layer structure
- [ ] Create mock API implementations
- [ ] Create custom hooks for data fetching
- [ ] Integrate with forms (mutations)
- [ ] Add TanStack Query DevTools (development)
