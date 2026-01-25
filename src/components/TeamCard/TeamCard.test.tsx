import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamCard } from './TeamCard';
import type { Team } from '../../types';

const createTeam = (id: string, name: string, playerCount: number): Team => ({
  id,
  name,
  players: Array.from({ length: playerCount }, (_, i) => ({
    id: `player-${i}`,
    name: `Player ${i + 1}`,
    timestamp: new Date(),
    priority: false,
  })),
});

describe('TeamCard', () => {
  it('should render team name', () => {
    const team = createTeam('1', 'Team 1', 0);
    render(<TeamCard team={team} />);
    expect(screen.getByText('Team 1')).toBeInTheDocument();
  });

  it('should display player count', () => {
    const team = createTeam('1', 'Team 1', 3);
    render(<TeamCard team={team} />);
    expect(screen.getByText(/3 players/i)).toBeInTheDocument();
  });

  it('should display singular "player" for one player', () => {
    const team = createTeam('1', 'Team 1', 1);
    render(<TeamCard team={team} />);
    expect(screen.getByText(/1 player$/i)).toBeInTheDocument();
  });

  it('should show empty message when no players', () => {
    const team = createTeam('1', 'Team 1', 0);
    render(<TeamCard team={team} />);
    expect(screen.getByText('No players assigned')).toBeInTheDocument();
  });

  it('should render players list when players exist', () => {
    const team = createTeam('1', 'Team 1', 2);
    render(<TeamCard team={team} />);
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
  });

  it('should render as article element', () => {
    const team = createTeam('1', 'Team 1', 0);
    const { container } = render(<TeamCard team={team} />);
    expect(container.querySelector('article')).toBeInTheDocument();
  });

  it('should render header element', () => {
    const team = createTeam('1', 'Team 1', 0);
    const { container } = render(<TeamCard team={team} />);
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('should render section element for players', () => {
    const team = createTeam('1', 'Team 1', 0);
    const { container } = render(<TeamCard team={team} />);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('should use custom team color when provided', () => {
    const team = createTeam('1', 'Team 1', 0);
    const { container } = render(<TeamCard team={team} teamColor="#FF0000" />);
    const article = container.querySelector('article');
    expect(article).toHaveStyle({ '--team-color': '#FF0000' });
  });
});
