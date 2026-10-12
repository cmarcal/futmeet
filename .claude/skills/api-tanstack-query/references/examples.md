# TanStack Query Examples

## API service layer

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

const USE_MOCK = import.meta.env.DEV;
export const playersAPI = USE_MOCK ? mockPlayersAPI : realPlayersAPI;
```

## Mutation usage in a component

```typescript
const { mutate: addPlayer, isPending } = useAddPlayer();
addPlayer(data, { onSuccess: () => {...}, onError: (err) => {...} });
```

## Optimistic updates

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
