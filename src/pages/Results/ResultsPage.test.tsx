import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import ResultsPage from './ResultsPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderResultsPage = () => {
  return render(
    <MemoryRouter>
      <ResultsPage />
    </MemoryRouter>
  );
};

describe('ResultsPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useGameStore.getState().reset();
  });

  it('should render page title', () => {
    renderResultsPage();

    expect(screen.getByRole('heading', { name: 'Team Results' })).toBeInTheDocument();
  });

  it('should show 0 players and 0 teams when store is empty', () => {
    renderResultsPage();

    expect(screen.getByText('0 players sorted into 0 teams')).toBeInTheDocument();
  });

  it('should show player and team count after sort', () => {
    useGameStore.getState().addPlayer('Alice');
    useGameStore.getState().addPlayer('Bob');
    useGameStore.getState().sortTeams();

    renderResultsPage();

    expect(screen.getByText('2 players sorted into 2 teams')).toBeInTheDocument();
  });

  it('should render New Game button', () => {
    renderResultsPage();

    expect(screen.getByRole('button', { name: 'New Game' })).toBeInTheDocument();
  });

  it('should render Back to Game button', () => {
    renderResultsPage();

    expect(screen.getByRole('button', { name: 'Back to Game' })).toBeInTheDocument();
  });

  it('should navigate to / when New Game is clicked', async () => {
    const user = userEvent.setup();
    renderResultsPage();

    await user.click(screen.getByRole('button', { name: 'New Game' }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should navigate to /game when Back to Game is clicked', async () => {
    const user = userEvent.setup();
    renderResultsPage();

    await user.click(screen.getByRole('button', { name: 'Back to Game' }));

    expect(mockNavigate).toHaveBeenCalledWith('/game');
  });
});
