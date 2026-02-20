import { describe, it, expect } from 'vitest';
import { sortTeams } from './teamSorter';
import type { Player } from '../types';

const createPlayer = (id: string, name: string, priority = false): Player => ({
  id,
  name,
  timestamp: new Date(),
  priority,
});

describe('sortTeams', () => {
  it('should return empty array when teamCount is less than 2', () => {
    const players: Player[] = [createPlayer('1', 'Player 1')];
    
    const result = sortTeams(players, 1);
    
    expect(result).toEqual([]);
  });

  it('should return empty teams when no players provided', () => {
    const result = sortTeams([], 2);
    
    expect(result).toHaveLength(2);
    expect(result[0].players).toHaveLength(0);
    expect(result[1].players).toHaveLength(0);
  });

  it('should distribute players into two teams using round-robin', () => {
    const players: Player[] = [
      createPlayer('1', 'Player 1'),
      createPlayer('2', 'Player 2'),
      createPlayer('3', 'Player 3'),
      createPlayer('4', 'Player 4'),
    ];
    
    const result = sortTeams(players, 2);
    
    expect(result).toHaveLength(2);
    expect(result[0].players).toHaveLength(2);
    expect(result[1].players).toHaveLength(2);
  });

  it('should handle odd number of players', () => {
    const players: Player[] = [
      createPlayer('1', 'Player 1'),
      createPlayer('2', 'Player 2'),
      createPlayer('3', 'Player 3'),
    ];
    
    const result = sortTeams(players, 2);
    
    const totalPlayers = result[0].players.length + result[1].players.length;
    expect(totalPlayers).toBe(3);
    expect(Math.abs(result[0].players.length - result[1].players.length)).toBeLessThanOrEqual(1);
  });

  it('should distribute priority players first', () => {
    const players: Player[] = [
      createPlayer('1', 'Priority 1', true),
      createPlayer('2', 'Regular 1', false),
      createPlayer('3', 'Priority 2', true),
      createPlayer('4', 'Regular 2', false),
    ];
    
    const result = sortTeams(players, 2);
    
    // Priority players should be in different teams (round-robin)
    const team1HasPriority = result[0].players.some(p => p.priority);
    const team2HasPriority = result[1].players.some(p => p.priority);
    
    expect(team1HasPriority).toBe(true);
    expect(team2HasPriority).toBe(true);
  });

  it('should create correct number of teams', () => {
    const players: Player[] = [
      createPlayer('1', 'Player 1'),
      createPlayer('2', 'Player 2'),
      createPlayer('3', 'Player 3'),
      createPlayer('4', 'Player 4'),
      createPlayer('5', 'Player 5'),
      createPlayer('6', 'Player 6'),
    ];
    
    const result = sortTeams(players, 3);
    
    expect(result).toHaveLength(3);
    expect(result[0].players).toHaveLength(2);
    expect(result[1].players).toHaveLength(2);
    expect(result[2].players).toHaveLength(2);
  });
});
