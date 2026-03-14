import type { Room, Player } from '@futmeet/shared/types';
import type { RoomRepository, WriteResult } from '@modules/room/repository/index.js';
import type { GameRepository } from '@modules/game/repository/index.js';
import {
  RoomNotFound,
  RoomPlayerNotFound,
  RoomAlreadyStarted,
  InvalidReorderIndices,
} from '@modules/room/error/index.js';

export class RoomService {
  constructor(
    private readonly roomRepo: RoomRepository,
    private readonly gameRepo: GameRepository
  ) {}

  async createRoom(): Promise<Room> {
    return this.roomRepo.create();
  }

  async getRoom(roomId: string): Promise<Room> {
    const room = await this.roomRepo.findById(roomId);
    if (!room) throw new RoomNotFound(roomId);
    return room;
  }

  async addPlayer(roomId: string, name: string, notes?: string): Promise<Player> {
    const result = await this.roomRepo.addPlayer(roomId, name, notes);
    return this.unwrapRoomResult(result, roomId);
  }

  async removePlayer(roomId: string, playerId: string): Promise<void> {
    const result = await this.roomRepo.removePlayer(roomId, playerId);
    this.unwrapRoomResult(result, roomId, playerId);
  }

  async togglePriority(roomId: string, playerId: string): Promise<Player> {
    const room = await this.roomRepo.findById(roomId);
    if (!room) throw new RoomNotFound(roomId);
    const current = room.players.find((p) => p.id === playerId);
    if (!current) throw new RoomPlayerNotFound(playerId);
    const result = await this.roomRepo.setPriority(roomId, playerId, !current.priority);
    return this.unwrapRoomResult(result, roomId, playerId);
  }

  async reorderPlayers(roomId: string, fromIndex: number, toIndex: number): Promise<Room> {
    const result = await this.roomRepo.reorder(roomId, fromIndex, toIndex);
    this.unwrapRoomResult(result, roomId);
    return this.roomRepo.findById(roomId) as Promise<Room>;
  }

  async clearPlayers(roomId: string): Promise<void> {
    const result = await this.roomRepo.clearPlayers(roomId);
    this.unwrapRoomResult(result, roomId);
  }

  async startGame(roomId: string) {
    const room = await this.roomRepo.findById(roomId);
    if (!room) throw new RoomNotFound(roomId);
    const result = await this.gameRepo.createFromRoom(roomId, room.players);
    if (!result.ok) {
      if (result.reason === 'room_not_found') throw new RoomNotFound(roomId);
      throw new RoomAlreadyStarted(roomId);
    }
    return result.data;
  }

  private unwrapRoomResult<T>(result: WriteResult<T>, roomId: string, playerId?: string): T {
    if (!result.ok) {
      if (result.reason === 'room_not_found') throw new RoomNotFound(roomId);
      if (result.reason === 'room_already_started') throw new RoomAlreadyStarted(roomId);
      if (result.reason === 'invalid_indices') throw new InvalidReorderIndices();
      throw new RoomPlayerNotFound(playerId ?? '');
    }
    return result.data;
  }
}
