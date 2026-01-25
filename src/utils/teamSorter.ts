import type { Player, Team } from '../types'

/**
 * Sorts players into teams using a round-robin algorithm.
 * Priority players are distributed evenly first, then remaining players.
 *
 * @param players - Array of players to sort into teams
 * @param teamCount - Number of teams to create (must be at least 2)
 * @returns Array of teams with players distributed evenly
 *
 * @example
 * const players = [
 *   { id: '1', name: 'Alice', timestamp: new Date(), priority: true },
 *   { id: '2', name: 'Bob', timestamp: new Date(), priority: false }
 * ]
 * const teams = sortTeams(players, 2)
 */
export const sortTeams = (players: Player[], teamCount: number): Team[] => {
  // Edge case: If team count is less than 2, return empty array
  if (teamCount < 2) {
    return []
  }

  // Edge case: If no players, return empty teams
  if (players.length === 0) {
    return createEmptyTeams(teamCount)
  }

  // Separate priority players from regular players
  const priorityPlayers = players.filter((player) => player.priority)
  const regularPlayers = players.filter((player) => !player.priority)

  // Create empty teams array with names like "Team 1", "Team 2", etc.
  const teams: Team[] = createEmptyTeams(teamCount)

  // Distribute priority players evenly using round-robin
  distributePlayersRoundRobin(priorityPlayers, teams)

  // Distribute remaining players using round-robin
  distributePlayersRoundRobin(regularPlayers, teams)

  return teams
}

/**
 * Creates an array of empty teams with sequential names.
 *
 * @param teamCount - Number of teams to create
 * @returns Array of empty teams
 */
const createEmptyTeams = (teamCount: number): Team[] => {
  return Array.from({ length: teamCount }, (_, index) => ({
    id: `team-${index + 1}`,
    name: `Team ${index + 1}`,
    players: [],
  }))
}

/**
 * Distributes players across teams using round-robin algorithm.
 * Players are assigned to teams in order: Team 1, Team 2, ..., Team N, Team 1, ...
 *
 * @param players - Array of players to distribute
 * @param teams - Array of teams to distribute players into
 */
const distributePlayersRoundRobin = (
  players: Player[],
  teams: Team[],
): void => {
  players.forEach((player, index) => {
    // Round-robin: cycle through teams using modulo
    const teamIndex = index % teams.length
    teams[teamIndex].players.push(player)
  })
}
