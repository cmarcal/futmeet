import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { PlayerCard } from './PlayerCard';
import type { Player } from '../../types';

const mockPlayer: Player = {
  id: 'player-1',
  name: 'Alice Silva',
  priority: false,
  timestamp: new Date('2024-01-01'),
};

const mockPriorityPlayer: Player = {
  id: 'player-2',
  name: 'Bob Santos',
  priority: true,
  timestamp: new Date('2024-01-01'),
};

describe('PlayerCard accessibility', () => {
  it('should have no violations with default player', async () => {
    const { container } = render(
      <PlayerCard
        player={mockPlayer}
        index={0}
        onTogglePriority={() => {}}
        onRemove={() => {}}
        showActions={true}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations with priority player', async () => {
    const { container } = render(
      <PlayerCard
        player={mockPriorityPlayer}
        index={1}
        onTogglePriority={() => {}}
        onRemove={() => {}}
        showActions={true}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations without actions', async () => {
    const { container } = render(
      <PlayerCard player={mockPlayer} index={0} showActions={false} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations when draggable', async () => {
    const { container } = render(
      <PlayerCard
        player={mockPlayer}
        index={0}
        onTogglePriority={() => {}}
        onRemove={() => {}}
        showActions={true}
        draggable={true}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
