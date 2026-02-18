import { useEffect } from 'react';
import { useGameStore, initialGameData } from '../stores/gameStore';
import type { Player, Team, GameStatus } from '../types';

interface UseGameReturn {
  players: Player[];
  teams: Team[];
  teamCount: number;
  gameStatus: GameStatus;
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  togglePriority: (playerId: string) => void;
  reorderPlayers: (fromIndex: number, toIndex: number) => void;
  setTeamCount: (count: number) => void;
  sortTeams: () => void;
}

export const useGame = (gameId: string): UseGameReturn => {
  const gameData = useGameStore((state) => state.games[gameId]);
  const initGame = useGameStore((state) => state.initGame);
  const addPlayerAction = useGameStore((state) => state.addPlayer);
  const removePlayerAction = useGameStore((state) => state.removePlayer);
  const togglePriorityAction = useGameStore((state) => state.togglePriority);
  const reorderPlayersAction = useGameStore((state) => state.reorderPlayers);
  const setTeamCountAction = useGameStore((state) => state.setTeamCount);
  const sortTeamsAction = useGameStore((state) => state.sortTeams);

  useEffect(() => {
    initGame(gameId);
  }, [gameId, initGame]);

  const data = gameData ?? initialGameData;

  return {
    players: data.players,
    teams: data.teams,
    teamCount: data.teamCount,
    gameStatus: data.gameStatus,
    addPlayer: (name: string) => addPlayerAction(gameId, name),
    removePlayer: (playerId: string) => removePlayerAction(gameId, playerId),
    togglePriority: (playerId: string) => togglePriorityAction(gameId, playerId),
    reorderPlayers: (fromIndex: number, toIndex: number) => reorderPlayersAction(gameId, fromIndex, toIndex),
    setTeamCount: (count: number) => setTeamCountAction(gameId, count),
    sortTeams: () => sortTeamsAction(gameId),
  };
};
