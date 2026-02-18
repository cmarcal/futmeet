import { useGameStore } from '../stores/gameStore';
import type { Player } from '../types';

interface UseWaitingRoomReturn {
  players: Player[];
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  togglePriority: (playerId: string) => void;
  reorderPlayers: (fromIndex: number, toIndex: number) => void;
  clearWaitingRoom: () => void;
  createGameFromWaitingRoom: () => string;
}

export const useWaitingRoom = (): UseWaitingRoomReturn => {
  const players = useGameStore((state) => state.waitingRoomPlayers);
  const addWaitingRoomPlayer = useGameStore((state) => state.addWaitingRoomPlayer);
  const removeWaitingRoomPlayer = useGameStore((state) => state.removeWaitingRoomPlayer);
  const toggleWaitingRoomPriority = useGameStore((state) => state.toggleWaitingRoomPriority);
  const reorderWaitingRoomPlayers = useGameStore((state) => state.reorderWaitingRoomPlayers);
  const clearWaitingRoom = useGameStore((state) => state.clearWaitingRoom);
  const createGameFromWaitingRoom = useGameStore((state) => state.createGameFromWaitingRoom);

  return {
    players,
    addPlayer: addWaitingRoomPlayer,
    removePlayer: removeWaitingRoomPlayer,
    togglePriority: toggleWaitingRoomPriority,
    reorderPlayers: reorderWaitingRoomPlayers,
    clearWaitingRoom,
    createGameFromWaitingRoom,
  };
};
