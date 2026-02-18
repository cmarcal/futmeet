import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import HomePage from '../../pages/Home/HomePage';
import GamePage from '../../pages/Game/GamePage';
import ResultsPage from '../../pages/Results/ResultsPage';

const VALID_GAME_ID = 'V1StGXR8_Z5jdHi6B-myT';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderApp = (initialPath = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/results/:gameId" element={<ResultsPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Game Flow Integration', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useGameStore.setState({ games: {} });
  });

  describe('HomePage', () => {
    it('should navigate to a new game URL when Start Game is clicked', async () => {
      const user = userEvent.setup();
      renderApp('/');
      await user.click(screen.getByRole('button', { name: 'Start Game' }));
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/game\/[A-Za-z0-9_-]{21}$/)
      );
    });
  });

  describe('GamePage', () => {
    it('should redirect to / for invalid gameId', () => {
      renderApp('/game/invalid');
      expect(screen.getByText('Start Game')).toBeInTheDocument();
    });

    it('should initialize game and show empty player list', () => {
      renderApp(`/game/${VALID_GAME_ID}`);
      expect(screen.getByRole('heading', { name: 'Players' })).toBeInTheDocument();
      expect(screen.getByText('No players yet')).toBeInTheDocument();
    });

    it('should add a player and show it in the list', async () => {
      const user = userEvent.setup();
      renderApp(`/game/${VALID_GAME_ID}`);
      const input = screen.getByPlaceholderText('Enter player name...');
      await user.type(input, 'Alice');
      await user.keyboard('{Enter}');
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should persist player to store', async () => {
      const user = userEvent.setup();
      renderApp(`/game/${VALID_GAME_ID}`);
      const input = screen.getByPlaceholderText('Enter player name...');
      await user.type(input, 'Bob');
      await user.keyboard('{Enter}');
      const game = useGameStore.getState().games[VALID_GAME_ID];
      expect(game?.players.some((p) => p.name === 'Bob')).toBe(true);
    });

    it('should navigate to results when Sort Teams is clicked with enough players', async () => {
      const user = userEvent.setup();
      useGameStore.getState().initGame(VALID_GAME_ID);
      useGameStore.getState().addPlayer(VALID_GAME_ID, 'Alice');
      useGameStore.getState().addPlayer(VALID_GAME_ID, 'Bob');
      renderApp(`/game/${VALID_GAME_ID}`);
      await user.click(screen.getByRole('button', { name: 'Sort Teams' }));
      expect(mockNavigate).toHaveBeenCalledWith(`/results/${VALID_GAME_ID}`);
    });
  });

  describe('ResultsPage', () => {
    it('should show sorted teams', () => {
      useGameStore.getState().initGame(VALID_GAME_ID);
      useGameStore.getState().addPlayer(VALID_GAME_ID, 'Alice');
      useGameStore.getState().addPlayer(VALID_GAME_ID, 'Bob');
      useGameStore.getState().sortTeams(VALID_GAME_ID);
      renderApp(`/results/${VALID_GAME_ID}`);
      expect(screen.getByRole('heading', { name: 'Team Results' })).toBeInTheDocument();
      expect(screen.getByText('2 players sorted into 2 teams')).toBeInTheDocument();
    });

    it('should navigate back to game when Back to Game is clicked', async () => {
      const user = userEvent.setup();
      renderApp(`/results/${VALID_GAME_ID}`);
      await user.click(screen.getByRole('button', { name: 'Back to Game' }));
      expect(mockNavigate).toHaveBeenCalledWith(`/game/${VALID_GAME_ID}`);
    });
  });
});
