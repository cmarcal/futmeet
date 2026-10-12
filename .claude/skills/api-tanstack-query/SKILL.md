---
name: api-tanstack-query
description: Use when implementing API calls, server state, caching, or mutations in the web app.
---

# API Integration with TanStack Query

TanStack Query owns all server state. Zustand owns client/UI state only.

## Rules

- One custom hook per query or mutation in `hooks/api/`; components never call `useQuery` directly
- Hierarchical query keys: `['players', gameId]`, `['player', playerId]`
- Components handle `isLoading` and `error` states
- Type every API function and hook return value
- Fetch calls live in `src/api/<resource>.ts`; MVP mocks in `src/api/mock/<resource>.ts`, switched by `import.meta.env.DEV`
- Mutations invalidate the affected query keys in `onSuccess`

## QueryClient

```typescript
// lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1, refetchOnWindowFocus: false },
  },
});
```

Wrap the app in `<QueryClientProvider client={queryClient}>`.

## Hook shape

```typescript
export const usePlayers = (gameId: string) =>
  useQuery({
    queryKey: ['players', gameId],
    queryFn: () => playersAPI.fetchPlayers(gameId),
  });

export const useAddPlayer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (player: AddPlayerInput) => playersAPI.addPlayer(player),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['players'] }),
  });
};
```

## Zustand sync

Copy server data into a store only when UI logic needs it, via `useEffect` on the query's `data`. Store patterns: `state-management-zustand` skill.

## References

Read `references/examples.md` for the API service layer, mock API with localStorage, optimistic updates, polling and the Zustand sync snippet.
