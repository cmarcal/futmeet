import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ShareService } from '@modules/share/service/index.js';

interface RoomParams { roomId: string }
interface GameParams { gameId: string }

const sendHtml = (reply: FastifyReply, html: string): void => {
  reply
    .header('Cache-Control', 'public, max-age=60')
    .type('text/html; charset=utf-8')
    .send(html);
};

export class ShareController {
  constructor(private readonly service: ShareService) {}

  getRoomPreview = async (
    req: FastifyRequest<{ Params: RoomParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    sendHtml(reply, await this.service.getRoomPreviewHtml(req.params.roomId));
  };

  getResultsPreview = async (
    req: FastifyRequest<{ Params: GameParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    sendHtml(reply, await this.service.getResultsPreviewHtml(req.params.gameId));
  };
}
