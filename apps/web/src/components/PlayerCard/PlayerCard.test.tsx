import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerCard } from './PlayerCard';
import type { Player } from '../../types';

const createPlayer = (id: string, name: string, priority = false): Player => ({
  id,
  name,
  timestamp: new Date(),
  priority,
});

describe('PlayerCard', () => {
  it('should render player name', () => {
    const player = createPlayer('1', 'John Doe');
    render(<PlayerCard player={player} index={0} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should display order number', () => {
    const player = createPlayer('1', 'Player 1');
    render(<PlayerCard player={player} index={2} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should show priority button with active state when player has priority', () => {
    const player = createPlayer('1', 'Priority Player', true);
    render(<PlayerCard player={player} index={0} onTogglePriority={() => {}} />);
    const priorityButton = screen.getByLabelText('Remover prioridade');
    expect(priorityButton).toBeInTheDocument();
    expect(priorityButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should show priority button with inactive state when player does not have priority', () => {
    const player = createPlayer('1', 'Regular Player', false);
    render(<PlayerCard player={player} index={0} onTogglePriority={() => {}} />);
    const priorityButton = screen.getByLabelText('Marcar como prioridade');
    expect(priorityButton).toBeInTheDocument();
    expect(priorityButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('should call onTogglePriority when priority button is clicked', async () => {
    const player = createPlayer('1', 'Player 1');
    const handleTogglePriority = vi.fn();
    const user = userEvent.setup();

    render(<PlayerCard player={player} index={0} onTogglePriority={handleTogglePriority} />);
    await user.click(screen.getByLabelText('Marcar como prioridade'));

    expect(handleTogglePriority).toHaveBeenCalledWith('1');
  });

  it('should call onRemove when remove button is clicked', async () => {
    const player = createPlayer('1', 'Player 1');
    const handleRemove = vi.fn();
    const user = userEvent.setup();

    render(<PlayerCard player={player} index={0} onRemove={handleRemove} />);
    await user.click(screen.getByLabelText('Remover Player 1'));

    expect(handleRemove).toHaveBeenCalledWith('1');
  });

  it('should not show actions when showActions is false', () => {
    const player = createPlayer('1', 'Player 1');
    render(<PlayerCard player={player} index={0} showActions={false} />);
    expect(screen.queryByLabelText('Marcar como prioridade')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Remover Player 1')).not.toBeInTheDocument();
  });

  it('should not display notes when provided (notes feature removed)', () => {
    const player: Player = {
      id: '1',
      name: 'Player 1',
      timestamp: new Date(),
      priority: false,
      notes: 'Goalkeeper',
    };
    render(<PlayerCard player={player} index={0} />);
    expect(screen.queryByText('Goalkeeper')).not.toBeInTheDocument();
  });

  it('should have correct aria-label for priority button when player has priority', () => {
    const player = createPlayer('1', 'Player 1', true);
    render(<PlayerCard player={player} index={0} onTogglePriority={() => {}} />);
    expect(screen.getByLabelText('Remover prioridade')).toBeInTheDocument();
  });
});
