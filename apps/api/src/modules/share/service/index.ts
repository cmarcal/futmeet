import type { RoomRepository } from '@modules/room/repository/index.js';
import type { GameRepository } from '@modules/game/repository/index.js';
import { RoomNotFound } from '@modules/room/error/index.js';
import { GameNotFound } from '@modules/game/error/index.js';
import { renderSharePreview, truncate } from '@modules/share/render/index.js';

const MAX_DESCRIPTION = 200;
const MAX_LISTED_PLAYERS = 5;

const plural = (count: number, word: string): string => `${count} ${word}${count === 1 ? '' : 's'}`;

export class ShareService {
  private readonly spaBaseUrl: string;

  constructor(
    private readonly roomRepo: RoomRepository,
    private readonly gameRepo: GameRepository,
    spaBaseUrl: string
  ) {
    this.spaBaseUrl = spaBaseUrl.replace(/\/+$/, '');
  }

  async getRoomPreviewHtml(roomId: string): Promise<string> {
    const room = await this.roomRepo.findById(roomId);
    if (!room) throw new RoomNotFound(roomId);
    const names = room.players.slice(0, MAX_LISTED_PLAYERS).map((p) => p.name);
    const extra = room.players.length - names.length;
    const description =
      room.players.length === 0
        ? 'Join the room and sign up for the game.'
        : `${plural(room.players.length, 'player')} signed up: ${names.join(', ')}${extra > 0 ? `, +${extra} more` : ''}`;
    return renderSharePreview({
      title: 'Join our FutMeet game',
      description: truncate(description, MAX_DESCRIPTION),
      redirectUrl: `${this.spaBaseUrl}/waiting-room/${encodeURIComponent(room.id)}`,
    });
  }

  async getResultsPreviewHtml(gameId: string): Promise<string> {
    const game = await this.gameRepo.findById(gameId);
    if (!game) throw new GameNotFound(gameId);
    const description =
      game.teams.length > 0
        ? game.teams.map((t) => `${t.name} (${t.players.length})`).join(' · ')
        : `${plural(game.players.length, 'player')} ready to be sorted into teams.`;
    return renderSharePreview({
      title: 'FutMeet team results',
      description: truncate(description, MAX_DESCRIPTION),
      redirectUrl: `${this.spaBaseUrl}/results/${encodeURIComponent(game.id)}`,
    });
  }
}
