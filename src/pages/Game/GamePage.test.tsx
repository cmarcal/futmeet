import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import GamePage from './GamePage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderGamePage = () => {
  return render(
    <MemoryRouter>
      <GamePage />
    </MemoryRouter>
  );
};

describe('GamePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useGameStore.getState().reset();
  });

  it('should render page title and subtitle', () => {
    renderGamePage();

    expect(screen.getByRole('heading', { name: 'Players' })).toBeInTheDocument();
    expect(screen.getByText('Manage your game roster')).toBeInTheDocument();
  });

  it('should render New Game button', () => {
    renderGamePage();

    expect(screen.getByRole('button', { name: 'New Game' })).toBeInTheDocument();
  });

  it('should render Add New Player section', () => {
    renderGamePage();

    expect(screen.getByRole('heading', { name: 'Add New Player' })).toBeInTheDocument();
  });

  it('should render Player List section', () => {
    renderGamePage();

    expect(screen.getByRole('heading', { name: 'Player List' })).toBeInTheDocument();
    expect(screen.getByText('Arrival order')).toBeInTheDocument();
  });

  it('should render Sort Teams button disabled when not enough players', () => {
    renderGamePage();

    const sortButton = screen.getByRole('button', { name: 'Sort Teams' });
    expect(sortButton).toBeDisabled();
  });

  it('should navigate to / when New Game is clicked', async () => {
    const user = userEvent.setup();
    renderGamePage();

    await user.click(screen.getByRole('button', { name: 'New Game' }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
