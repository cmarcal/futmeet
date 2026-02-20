import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    expect(screen.getByText('Nenhum jogador ainda')).toBeInTheDocument();
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
    render(<PlayerList players={players} onTogglePriority={handleTogglePriority} />);

    const priorityButton = screen.getByLabelText(/prioridade/i);
    const user = userEvent.setup();
    await user.click(priorityButton);
    expect(handleTogglePriority).toHaveBeenCalled();
  });

  it('should call onRemove when player is removed', async () => {
    const players = [createPlayer('1', 'Player 1')];
    const handleRemove = vi.fn();
    render(<PlayerList players={players} onRemove={handleRemove} />);

    const removeButton = screen.getByLabelText(/remover/i);
    const user = userEvent.setup();
    await user.click(removeButton);
    expect(handleRemove).toHaveBeenCalled();
  });

  it('should not show actions when showActions is false', () => {
    const players = [createPlayer('1', 'Player 1')];
    const { container } = render(<PlayerList players={players} showActions={false} />);
    expect(container.querySelector('[aria-label*="prioridade"]')).not.toBeInTheDocument();
  });
});
