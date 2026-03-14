import type { FastifyRequest, FastifyReply } from 'fastify';
import type { GameService } from '@modules/game/service/index.js';

interface GameParams { gameId: string }
interface PlayerParams { gameId: string; playerId: string }
interface AddPlayerBody { name: string; notes?: string }
interface ReorderBody { fromIndex: number; toIndex: number }
interface SetTeamCountBody { teamCount: number }

export class GameController {
  constructor(private readonly service: GameService) {}

  createGame = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const game = await this.service.createGame();
    reply.status(201).send({ gameId: game.id });
  };

  getGame = async (req: FastifyRequest<{ Params: GameParams }>, reply: FastifyReply): Promise<void> => {
    const game = await this.service.getGame(req.params.gameId);
    reply.send(game);
  };

  addPlayer = async (
    req: FastifyRequest<{ Params: GameParams; Body: AddPlayerBody }>,
    reply: FastifyReply
  ): Promise<void> => {
    const player = await this.service.addPlayer(req.params.gameId, req.body.name, req.body.notes);
    reply.status(201).send(player);
  };

  removePlayer = async (
    req: FastifyRequest<{ Params: PlayerParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    await this.service.removePlayer(req.params.gameId, req.params.playerId);
    reply.status(204).send();
  };

  togglePriority = async (
    req: FastifyRequest<{ Params: PlayerParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    const player = await this.service.togglePriority(req.params.gameId, req.params.playerId);
    reply.send(player);
  };

  reorderPlayers = async (
    req: FastifyRequest<{ Params: GameParams; Body: ReorderBody }>,
    reply: FastifyReply
  ): Promise<void> => {
    const game = await this.service.reorderPlayers(
      req.params.gameId,
      req.body.fromIndex,
      req.body.toIndex
    );
    reply.send(game);
  };

  setTeamCount = async (
    req: FastifyRequest<{ Params: GameParams; Body: SetTeamCountBody }>,
    reply: FastifyReply
  ): Promise<void> => {
    const game = await this.service.setTeamCount(req.params.gameId, req.body.teamCount);
    reply.send(game);
  };

  sortTeams = async (
    req: FastifyRequest<{ Params: GameParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    const game = await this.service.sortTeams(req.params.gameId);
    reply.send(game);
  };
}
