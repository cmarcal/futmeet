import type { Room, Player } from '@futmeet/shared/types';
import type { RoomRepository } from '@modules/room/repository/index.js';
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
    await this.assertRoomExists(roomId);
    await this.assertNotStarted(roomId);
    return this.roomRepo.addPlayer(roomId, name, notes);
  }

  async removePlayer(roomId: string, playerId: string): Promise<void> {
    await this.assertRoomExists(roomId);
    await this.assertNotStarted(roomId);
    const ok = await this.roomRepo.removePlayer(roomId, playerId);
    if (!ok) throw new RoomPlayerNotFound(playerId);
  }

  async togglePriority(roomId: string, playerId: string): Promise<Player> {
    await this.assertRoomExists(roomId);
    await this.assertNotStarted(roomId);
    const room = await this.roomRepo.findById(roomId);
    const current = room!.players.find((p) => p.id === playerId);
    if (!current) throw new RoomPlayerNotFound(playerId);
    const updated = await this.roomRepo.setPriority(roomId, playerId, !current.priority);
    if (!updated) throw new RoomPlayerNotFound(playerId);
    return updated;
  }

  async reorderPlayers(roomId: string, fromIndex: number, toIndex: number): Promise<Room> {
    await this.assertRoomExists(roomId);
    await this.assertNotStarted(roomId);
    const ok = await this.roomRepo.reorder(roomId, fromIndex, toIndex);
    if (!ok) throw new InvalidReorderIndices();
    return this.roomRepo.findById(roomId) as Promise<Room>;
  }

  async clearPlayers(roomId: string): Promise<void> {
    await this.assertRoomExists(roomId);
    await this.assertNotStarted(roomId);
    await this.roomRepo.clearPlayers(roomId);
  }

  async startGame(roomId: string) {
    const room = await this.roomRepo.findById(roomId);
    if (!room) throw new RoomNotFound(roomId);
    return this.gameRepo.createFromRoom(roomId, room.players);
  }

  private async assertRoomExists(roomId: string): Promise<void> {
    const exists = await this.roomRepo.findById(roomId);
    if (!exists) throw new RoomNotFound(roomId);
  }

  private async assertNotStarted(roomId: string): Promise<void> {
    const started = await this.roomRepo.hasGame(roomId);
    if (started) throw new RoomAlreadyStarted(roomId);
  }
}
