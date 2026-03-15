import type { FastifyRequest, FastifyReply } from 'fastify';
import type { RoomService } from '@modules/room/service/index.js';

interface RoomParams { roomId: string }
interface PlayerParams { roomId: string; playerId: string }
interface AddPlayerBody { name: string; notes?: string }
interface ReorderBody { fromIndex: number; toIndex: number }

export class RoomController {
  constructor(private readonly service: RoomService) {}

  createRoom = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const room = await this.service.createRoom();
    reply.status(201).send({ roomId: room.id });
  };

  getRoom = async (req: FastifyRequest<{ Params: RoomParams }>, reply: FastifyReply): Promise<void> => {
    const room = await this.service.getRoom(req.params.roomId);
    reply.send(room);
  };

  addPlayer = async (
    req: FastifyRequest<{ Params: RoomParams; Body: AddPlayerBody }>,
    reply: FastifyReply
  ): Promise<void> => {
    const player = await this.service.addPlayer(req.params.roomId, req.body.name, req.body.notes);
    reply.status(201).send(player);
  };

  removePlayer = async (
    req: FastifyRequest<{ Params: PlayerParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    await this.service.removePlayer(req.params.roomId, req.params.playerId);
    reply.status(204).send();
  };

  togglePriority = async (
    req: FastifyRequest<{ Params: PlayerParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    const player = await this.service.togglePriority(req.params.roomId, req.params.playerId);
    reply.send(player);
  };

  reorderPlayers = async (
    req: FastifyRequest<{ Params: RoomParams; Body: ReorderBody }>,
    reply: FastifyReply
  ): Promise<void> => {
    const room = await this.service.reorderPlayers(
      req.params.roomId,
      req.body.fromIndex,
      req.body.toIndex
    );
    reply.send(room);
  };

  clearPlayers = async (
    req: FastifyRequest<{ Params: RoomParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    await this.service.clearPlayers(req.params.roomId);
    reply.status(204).send();
  };

  startGame = async (
    req: FastifyRequest<{ Params: RoomParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    const game = await this.service.startGame(req.params.roomId);
    reply.status(201).send(game);
  };
}
