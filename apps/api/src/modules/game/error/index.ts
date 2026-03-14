import { AppError } from '@core/error/index.js';

export class GameNotFound extends AppError {
  constructor(gameId: string) {
    super('GAME_NOT_FOUND', `Game '${gameId}' not found`, 404);
  }
}

export class GamePlayerNotFound extends AppError {
  constructor(playerId: string) {
    super('GAME_PLAYER_NOT_FOUND', `Player '${playerId}' not found in game`, 404);
  }
}

export class InvalidReorderIndices extends AppError {
  constructor() {
    super('INVALID_REORDER_INDICES', 'fromIndex and toIndex must be valid player positions', 400);
  }
}

export class InvalidTeamCount extends AppError {
  constructor() {
    super('INVALID_TEAM_COUNT', 'teamCount must be between 2 and 10', 400);
  }
}
