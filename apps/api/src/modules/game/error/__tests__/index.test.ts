import { describe, it, expect } from 'vitest';
import { AppError } from '../../../../core/error/index.js';
import {
  GameNotFound,
  GamePlayerNotFound,
  InvalidReorderIndices,
  InvalidTeamCount,
} from '../index.js';

describe('GameNotFound', () => {
  it('has statusCode 404', () => {
    const error = new GameNotFound('game123');
    expect(error.statusCode).toBe(404);
  });

  it('has code GAME_NOT_FOUND', () => {
    const error = new GameNotFound('game123');
    expect(error.code).toBe('GAME_NOT_FOUND');
  });

  it('message contains the gameId', () => {
    const gameId = 'game123';
    const error = new GameNotFound(gameId);
    expect(error.message).toContain(gameId);
  });

  it('is an instance of AppError', () => {
    const error = new GameNotFound('game123');
    expect(error).toBeInstanceOf(AppError);
  });

  it('is an instance of Error', () => {
    const error = new GameNotFound('game123');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('GamePlayerNotFound', () => {
  it('has statusCode 404', () => {
    const error = new GamePlayerNotFound('player456');
    expect(error.statusCode).toBe(404);
  });

  it('has code GAME_PLAYER_NOT_FOUND', () => {
    const error = new GamePlayerNotFound('player456');
    expect(error.code).toBe('GAME_PLAYER_NOT_FOUND');
  });

  it('message contains the playerId', () => {
    const playerId = 'player456';
    const error = new GamePlayerNotFound(playerId);
    expect(error.message).toContain(playerId);
  });

  it('is an instance of AppError', () => {
    const error = new GamePlayerNotFound('player456');
    expect(error).toBeInstanceOf(AppError);
  });

  it('is an instance of Error', () => {
    const error = new GamePlayerNotFound('player456');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('InvalidReorderIndices', () => {
  it('has statusCode 400', () => {
    const error = new InvalidReorderIndices();
    expect(error.statusCode).toBe(400);
  });

  it('has code INVALID_REORDER_INDICES', () => {
    const error = new InvalidReorderIndices();
    expect(error.code).toBe('INVALID_REORDER_INDICES');
  });

  it('is an instance of AppError', () => {
    const error = new InvalidReorderIndices();
    expect(error).toBeInstanceOf(AppError);
  });

  it('is an instance of Error', () => {
    const error = new InvalidReorderIndices();
    expect(error).toBeInstanceOf(Error);
  });
});

describe('InvalidTeamCount', () => {
  it('has statusCode 400', () => {
    const error = new InvalidTeamCount();
    expect(error.statusCode).toBe(400);
  });

  it('has code INVALID_TEAM_COUNT', () => {
    const error = new InvalidTeamCount();
    expect(error.code).toBe('INVALID_TEAM_COUNT');
  });

  it('is an instance of AppError', () => {
    const error = new InvalidTeamCount();
    expect(error).toBeInstanceOf(AppError);
  });

  it('is an instance of Error', () => {
    const error = new InvalidTeamCount();
    expect(error).toBeInstanceOf(Error);
  });
});
