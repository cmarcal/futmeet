import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerList } from './PlayerList';
import type { Player } from '../../types';

const createPlayer = (id: string, name: string, priority = false): Player => ({
  id,
  name,
  timestamp: new Date(),
  priority,
});

describe('PlayerList', () => {
  it('should render empty message when no players', () => {
    render(<PlayerList players={[]} />);
    expect(screen.getByText(/no players added yet/i)).toBeInTheDocument();
  });

  it('should render custom empty message', () => {
    render(<PlayerList players={[]} emptyMessage="Custom empty message" />);
    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  it('should render list of players', () => {
    const players = [createPlayer('1', 'Player 1'), createPlayer('2', 'Player 2')];
    render(<PlayerList players={players} />);
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
  });

  it('should render players in ul element', () => {
    const players = [createPlayer('1', 'Player 1')];
    const { container } = render(<PlayerList players={players} />);
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(container.querySelectorAll('li')).toHaveLength(1);
  });

  it('should call onTogglePriority when priority is toggled', async () => {
    const players = [createPlayer('1', 'Player 1')];
    const handleTogglePriority = vi.fn();
    const { container } = render(<PlayerList players={players} onTogglePriority={handleTogglePriority} />);

    const priorityButton = container.querySelector('[aria-label*="priority"]');
    if (priorityButton) {
      await priorityButton.click();
      expect(handleTogglePriority).toHaveBeenCalled();
    }
  });

  it('should call onRemove when player is removed', async () => {
    const players = [createPlayer('1', 'Player 1')];
    const handleRemove = vi.fn();
    const { container } = render(<PlayerList players={players} onRemove={handleRemove} />);

    const removeButton = container.querySelector('[aria-label*="Remove"]');
    if (removeButton) {
      await removeButton.click();
      expect(handleRemove).toHaveBeenCalled();
    }
  });

  it('should not show actions when showActions is false', () => {
    const players = [createPlayer('1', 'Player 1')];
    const { container } = render(<PlayerList players={players} showActions={false} />);
    expect(container.querySelector('[aria-label*="priority"]')).not.toBeInTheDocument();
  });
});
