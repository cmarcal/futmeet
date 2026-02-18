import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import ResultsPage from './ResultsPage';

const VALID_GAME_ID = 'V1StGXR8_Z5jdHi6B-myT';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderResultsPage = (gameId = VALID_GAME_ID) => {
  return render(
    <MemoryRouter initialEntries={[`/results/${gameId}`]}>
      <Routes>
        <Route path="/results/:gameId" element={<ResultsPage />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ResultsPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useGameStore.setState({ games: {} });
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
    useGameStore.getState().initGame(VALID_GAME_ID);
    useGameStore.getState().addPlayer(VALID_GAME_ID, 'Alice');
    useGameStore.getState().addPlayer(VALID_GAME_ID, 'Bob');
    useGameStore.getState().sortTeams(VALID_GAME_ID);

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

  it('should navigate to a new game URL when New Game is clicked', async () => {
    const user = userEvent.setup();
    renderResultsPage();

    await user.click(screen.getByRole('button', { name: 'New Game' }));

    expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/^\/game\/[A-Za-z0-9_-]{21}$/));
  });

  it('should navigate to /game/:gameId when Back to Game is clicked', async () => {
    const user = userEvent.setup();
    renderResultsPage();

    await user.click(screen.getByRole('button', { name: 'Back to Game' }));

    expect(mockNavigate).toHaveBeenCalledWith(`/game/${VALID_GAME_ID}`);
  });

  it('should redirect to / when gameId is invalid', () => {
    renderResultsPage('invalid-id');

    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
