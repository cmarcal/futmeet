import { AppError } from '@core/error/index.js';

export class RoomNotFound extends AppError {
  constructor(roomId: string) {
    super('ROOM_NOT_FOUND', `Room '${roomId}' not found`, 404);
  }
}

export class RoomPlayerNotFound extends AppError {
  constructor(playerId: string) {
    super('ROOM_PLAYER_NOT_FOUND', `Player '${playerId}' not found in room`, 404);
  }
}

export class RoomAlreadyStarted extends AppError {
  constructor(roomId: string) {
    super('ROOM_ALREADY_STARTED', `Room '${roomId}' has already been started and cannot be modified`, 409);
  }
}

export class InvalidReorderIndices extends AppError {
  constructor() {
    super('INVALID_REORDER_INDICES', 'fromIndex and toIndex must be valid player positions', 400);
  }
}
