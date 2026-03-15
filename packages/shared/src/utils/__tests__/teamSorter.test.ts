import { describe, it, expect } from 'vitest';
import { sortTeams } from '../teamSorter.js';
import type { Player } from '../../types/index.js';

const makePlayer = (name: string, priority = false): Player => ({
  id: crypto.randomUUID(),
  name,
  priority,
  timestamp: new Date(),
});

describe('sortTeams', () => {
  it('returns empty array when teamCount < 2', () => {
    const players = [makePlayer('Alice')];
    expect(sortTeams(players, 1)).toEqual([]);
  });

  it('returns empty array when teamCount is 0', () => {
    expect(sortTeams([], 0)).toEqual([]);
  });

  it('returns teams with empty players arrays when players array is empty (still creates N teams)', () => {
    const teams = sortTeams([], 3);
    expect(teams).toHaveLength(3);
    teams.forEach((team) => {
      expect(team.players).toEqual([]);
    });
  });

  it('creates exactly teamCount teams', () => {
    const players = [makePlayer('Alice'), makePlayer('Bob'), makePlayer('Charlie')];
    const teams = sortTeams(players, 4);
    expect(teams).toHaveLength(4);
  });

  it('names teams "Time 1", "Time 2", etc.', () => {
    const teams = sortTeams([], 3);
    expect(teams[0].name).toBe('Time 1');
    expect(teams[1].name).toBe('Time 2');
    expect(teams[2].name).toBe('Time 3');
  });

  it('distributes 4 players into 2 teams — each team gets 2 players', () => {
    const players = [
      makePlayer('Alice'),
      makePlayer('Bob'),
      makePlayer('Charlie'),
      makePlayer('Diana'),
    ];
    const teams = sortTeams(players, 2);
    expect(teams[0].players).toHaveLength(2);
    expect(teams[1].players).toHaveLength(2);
  });

  it('distributes 3 players into 2 teams — total players preserved (3), not 4', () => {
    const players = [makePlayer('Alice'), makePlayer('Bob'), makePlayer('Charlie')];
    const teams = sortTeams(players, 2);
    const totalPlayers = teams.reduce((sum, team) => sum + team.players.length, 0);
    expect(totalPlayers).toBe(3);
  });

  it('all players in the output are a subset of the input players (none lost, none duplicated)', () => {
    const players = [
      makePlayer('Alice'),
      makePlayer('Bob'),
      makePlayer('Charlie'),
      makePlayer('Diana'),
    ];
    const inputIds = new Set(players.map((p) => p.id));
    const teams = sortTeams(players, 2);
    const outputPlayers = teams.flatMap((team) => team.players);

    expect(outputPlayers).toHaveLength(players.length);
    outputPlayers.forEach((p) => {
      expect(inputIds.has(p.id)).toBe(true);
    });

    const outputIds = outputPlayers.map((p) => p.id);
    const uniqueOutputIds = new Set(outputIds);
    expect(uniqueOutputIds.size).toBe(players.length);
  });

  it('priority players are placed before regular players', () => {
    // 1 priority + 1 regular + 2 teams:
    // round-robin assigns priority player to team 0, then regular player to team 1
    const priority = makePlayer('PriorityPlayer', true);
    const regular = makePlayer('RegularPlayer', false);
    const teams = sortTeams([priority, regular], 2);

    const team0Ids = teams[0].players.map((p) => p.id);
    const team1Ids = teams[1].players.map((p) => p.id);

    expect(team0Ids).toContain(priority.id);
    expect(team1Ids).toContain(regular.id);
  });

  it('with 4 priority players and 2 teams: all 4 are distributed across teams', () => {
    const priorityPlayers = [
      makePlayer('P1', true),
      makePlayer('P2', true),
      makePlayer('P3', true),
      makePlayer('P4', true),
    ];
    const teams = sortTeams(priorityPlayers, 2);
    const totalPlayers = teams.reduce((sum, team) => sum + team.players.length, 0);
    expect(totalPlayers).toBe(4);
  });

  it('each returned team has id, name, and players properties', () => {
    const teams = sortTeams([], 2);
    teams.forEach((team) => {
      expect(team).toHaveProperty('id');
      expect(team).toHaveProperty('name');
      expect(team).toHaveProperty('players');
      expect(typeof team.id).toBe('string');
      expect(typeof team.name).toBe('string');
      expect(Array.isArray(team.players)).toBe(true);
    });
  });
});
