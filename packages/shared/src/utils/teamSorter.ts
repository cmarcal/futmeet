import type { Player, Team } from '../types/index.js';
import { generatePlayerId } from './playerId.js';

export const sortTeams = (players: Player[], teamCount: number): Team[] => {
  if (teamCount < 2) {
    return [];
  }

  const teams: Team[] = createEmptyTeams(teamCount);

  if (players.length === 0) {
    return teams;
  }

  const priorityPlayers = players.filter((p) => p.priority);
  const regularPlayers = players.filter((p) => !p.priority);

  let currentIndex = 0;
  currentIndex = distributeRoundRobin(priorityPlayers, teams, currentIndex);
  distributeRoundRobin(regularPlayers, teams, currentIndex);

  return teams;
};

const createEmptyTeams = (teamCount: number): Team[] =>
  Array.from({ length: teamCount }, (_, i) => ({
    id: generatePlayerId(),
    name: `Time ${i + 1}`,
    players: [],
  }));

const distributeRoundRobin = (players: Player[], teams: Team[], startIndex: number): number => {
  players.forEach((player, i) => {
    const teamIndex = (startIndex + i) % teams.length;
    teams[teamIndex].players.push(player);
  });
  return (startIndex + players.length) % teams.length;
};
