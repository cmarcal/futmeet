import { describe, it, expect } from 'vitest';
import {
  RoomNotFound,
  RoomPlayerNotFound,
  RoomAlreadyStarted,
  InvalidReorderIndices,
} from '../index.js';
import { AppError } from '../../../../core/error/index.js';

describe('RoomNotFound', () => {
  const roomId = 'room-abc-123';
  const error = new RoomNotFound(roomId);

  it('has statusCode 404', () => {
    expect(error.statusCode).toBe(404);
  });

  it('has code ROOM_NOT_FOUND', () => {
    expect(error.code).toBe('ROOM_NOT_FOUND');
  });

  it('message contains the roomId', () => {
    expect(error.message).toContain(roomId);
  });

  it('is an instance of AppError', () => {
    expect(error).toBeInstanceOf(AppError);
  });

  it('is an instance of Error', () => {
    expect(error).toBeInstanceOf(Error);
  });
});

describe('RoomPlayerNotFound', () => {
  const playerId = 'player-xyz-456';
  const error = new RoomPlayerNotFound(playerId);

  it('has statusCode 404', () => {
    expect(error.statusCode).toBe(404);
  });

  it('has code ROOM_PLAYER_NOT_FOUND', () => {
    expect(error.code).toBe('ROOM_PLAYER_NOT_FOUND');
  });

  it('message contains the playerId', () => {
    expect(error.message).toContain(playerId);
  });

  it('is an instance of AppError', () => {
    expect(error).toBeInstanceOf(AppError);
  });

  it('is an instance of Error', () => {
    expect(error).toBeInstanceOf(Error);
  });
});

describe('RoomAlreadyStarted', () => {
  const roomId = 'room-started-789';
  const error = new RoomAlreadyStarted(roomId);

  it('has statusCode 409', () => {
    expect(error.statusCode).toBe(409);
  });

  it('has code ROOM_ALREADY_STARTED', () => {
    expect(error.code).toBe('ROOM_ALREADY_STARTED');
  });

  it('message contains the roomId', () => {
    expect(error.message).toContain(roomId);
  });

  it('is an instance of AppError', () => {
    expect(error).toBeInstanceOf(AppError);
  });

  it('is an instance of Error', () => {
    expect(error).toBeInstanceOf(Error);
  });
});

describe('InvalidReorderIndices', () => {
  const error = new InvalidReorderIndices();

  it('has statusCode 400', () => {
    expect(error.statusCode).toBe(400);
  });

  it('has code INVALID_REORDER_INDICES', () => {
    expect(error.code).toBe('INVALID_REORDER_INDICES');
  });

  it('is an instance of AppError', () => {
    expect(error).toBeInstanceOf(AppError);
  });

  it('is an instance of Error', () => {
    expect(error).toBeInstanceOf(Error);
  });
});
