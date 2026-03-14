import type { Game, Player } from '@futmeet/shared/types';
import type { GameRepository } from '@modules/game/repository/index.js';
import {
  GameNotFound,
  GamePlayerNotFound,
  InvalidReorderIndices,
  InvalidTeamCount,
} from '@modules/game/error/index.js';

export class GameService {
  constructor(private readonly gameRepo: GameRepository) {}

  async createGame(): Promise<Game> {
    return this.gameRepo.create();
  }

  async getGame(gameId: string): Promise<Game> {
    const game = await this.gameRepo.findById(gameId);
    if (!game) throw new GameNotFound(gameId);
    return game;
  }

  async addPlayer(gameId: string, name: string, notes?: string): Promise<Player> {
    await this.assertGameExists(gameId);
    return this.gameRepo.addPlayer(gameId, name, notes);
  }

  async removePlayer(gameId: string, playerId: string): Promise<void> {
    await this.assertGameExists(gameId);
    const ok = await this.gameRepo.removePlayer(gameId, playerId);
    if (!ok) throw new GamePlayerNotFound(playerId);
  }

  async togglePriority(gameId: string, playerId: string): Promise<Player> {
    const game = await this.gameRepo.findById(gameId);
    if (!game) throw new GameNotFound(gameId);
    const current = game.players.find((p) => p.id === playerId);
    if (!current) throw new GamePlayerNotFound(playerId);
    const updated = await this.gameRepo.setPriority(gameId, playerId, !current.priority);
    if (!updated) throw new GamePlayerNotFound(playerId);
    return updated;
  }

  async reorderPlayers(gameId: string, fromIndex: number, toIndex: number): Promise<Game> {
    await this.assertGameExists(gameId);
    const ok = await this.gameRepo.reorder(gameId, fromIndex, toIndex);
    if (!ok) throw new InvalidReorderIndices();
    return this.gameRepo.findById(gameId) as Promise<Game>;
  }

  async setTeamCount(gameId: string, teamCount: number): Promise<Game> {
    if (teamCount < 2 || teamCount > 10) throw new InvalidTeamCount();
    const game = await this.gameRepo.setTeamCount(gameId, teamCount);
    if (!game) throw new GameNotFound(gameId);
    return game;
  }

  async sortTeams(gameId: string): Promise<Game> {
    const game = await this.gameRepo.sort(gameId);
    if (!game) throw new GameNotFound(gameId);
    return game;
  }

  private async assertGameExists(gameId: string): Promise<void> {
    const exists = await this.gameRepo.findById(gameId);
    if (!exists) throw new GameNotFound(gameId);
  }
}
