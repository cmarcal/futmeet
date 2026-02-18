import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { Player } from '../types';

interface UseWaitingRoomReturn {
  players: Player[];
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  togglePriority: (playerId: string) => void;
  reorderPlayers: (fromIndex: number, toIndex: number) => void;
  clearWaitingRoom: () => void;
  createGameFromWaitingRoom: () => void;
}

export const useWaitingRoom = (roomId: string): UseWaitingRoomReturn => {
  const players = useGameStore((state) => state.waitingRooms[roomId] ?? []);
  const initWaitingRoom = useGameStore((state) => state.initWaitingRoom);
  const addWaitingRoomPlayer = useGameStore((state) => state.addWaitingRoomPlayer);
  const removeWaitingRoomPlayer = useGameStore((state) => state.removeWaitingRoomPlayer);
  const toggleWaitingRoomPriority = useGameStore((state) => state.toggleWaitingRoomPriority);
  const reorderWaitingRoomPlayers = useGameStore((state) => state.reorderWaitingRoomPlayers);
  const clearWaitingRoomAction = useGameStore((state) => state.clearWaitingRoom);
  const createGameFromWaitingRoomAction = useGameStore((state) => state.createGameFromWaitingRoom);

  useEffect(() => {
    initWaitingRoom(roomId);
  }, [roomId, initWaitingRoom]);

  return {
    players,
    addPlayer: (name: string) => addWaitingRoomPlayer(roomId, name),
    removePlayer: (playerId: string) => removeWaitingRoomPlayer(roomId, playerId),
    togglePriority: (playerId: string) => toggleWaitingRoomPriority(roomId, playerId),
    reorderPlayers: (fromIndex: number, toIndex: number) => reorderWaitingRoomPlayers(roomId, fromIndex, toIndex),
    clearWaitingRoom: () => clearWaitingRoomAction(roomId),
    createGameFromWaitingRoom: () => createGameFromWaitingRoomAction(roomId),
  };
};
