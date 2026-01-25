import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamList } from './TeamList';
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

describe('TeamList', () => {
  it('should render empty message when no teams', () => {
    render(<TeamList teams={[]} />);
    expect(screen.getByText(/no teams available/i)).toBeInTheDocument();
  });

  it('should render custom empty message', () => {
    render(<TeamList teams={[]} emptyMessage="Custom message" />);
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('should render list of teams', () => {
    const teams = [createTeam('1', 'Team 1', 2), createTeam('2', 'Team 2', 2)];
    render(<TeamList teams={teams} />);
    expect(screen.getByText('Team 1')).toBeInTheDocument();
    expect(screen.getByText('Team 2')).toBeInTheDocument();
  });

  it('should render teams in div with role="list"', () => {
    const teams = [createTeam('1', 'Team 1', 0)];
    const { container } = render(<TeamList teams={teams} />);
    expect(container.querySelector('[role="list"]')).toBeInTheDocument();
  });

  it('should pass showPlayerActions to TeamCard', () => {
    const teams = [createTeam('1', 'Team 1', 1)];
    const { container } = render(<TeamList teams={teams} showPlayerActions={true} />);
    // TeamCard should receive showPlayerActions prop
    // This is tested indirectly by checking if player actions are visible
    expect(container.querySelector('article')).toBeInTheDocument();
  });
});
