import type { Player, Team } from '../types';

/**
 * Sorts players into teams using a round-robin algorithm.
 * Priority players are distributed first, then remaining players continue from where priority left off.
 *
 * @param players - Array of players to sort into teams
 * @param teamCount - Number of teams to create (must be at least 2)
 * @returns Array of teams with players distributed evenly
 */
export const sortTeams = (players: Player[], teamCount: number): Team[] => {
  if (teamCount < 2) {
    return [];
  }

  const teams: Team[] = createEmptyTeams(teamCount);

  if (players.length === 0) {
    return teams;
  }

  const priorityPlayers = players.filter((player) => player.priority);
  const regularPlayers = players.filter((player) => !player.priority);

  let currentIndex = 0;
  currentIndex = distributePlayersRoundRobin(priorityPlayers, teams, currentIndex);
  distributePlayersRoundRobin(regularPlayers, teams, currentIndex);

  return teams;
};

/**
 * Creates an array of empty teams with sequential names.
 */
const createEmptyTeams = (teamCount: number): Team[] => {
  return Array.from({ length: teamCount }, (_, index) => ({
    id: crypto.randomUUID(),
    name: `Team ${index + 1}`,
    players: [],
  }));
};

/**
 * Distributes players across teams using round-robin algorithm, starting from a given index.
 * Returns the next index to continue from.
 */
const distributePlayersRoundRobin = (players: Player[], teams: Team[], startIndex: number): number => {
  players.forEach((player, i) => {
    const teamIndex = (startIndex + i) % teams.length;
    teams[teamIndex].players.push(player);
  });
  return (startIndex + players.length) % teams.length;
};
