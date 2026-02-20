import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import HomePage from '../../pages/Home/HomePage';
import GamePage from '../../pages/Game/GamePage';
import ResultsPage from '../../pages/Results/ResultsPage';
import WaitingRoomPage from '../../pages/WaitingRoom/WaitingRoomPage';

const VALID_GAME_ID = 'V1StGXR8_Z5jdHi6B-myT';
const VALID_ROOM_ID = 'V1StGXR8_Z5jdHi6B-myT';

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
        <Route path="/waiting-room/:roomId" element={<WaitingRoomPage />} />
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
      await user.click(screen.getByRole('button', { name: 'Iniciar Partida' }));
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/game\/[A-Za-z0-9]{21}$/)
      );
    });

    it('should navigate to waiting room when Sala de Espera is clicked', async () => {
      const user = userEvent.setup();
      renderApp('/');
      await user.click(screen.getByRole('button', { name: 'Sala de Espera' }));
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/waiting-room\/[A-Za-z0-9_-]{21}$/)
      );
    });
  });

  describe('WaitingRoomPage', () => {
    beforeEach(() => {
      useGameStore.setState({ waitingRooms: {}, games: {} });
    });

    it('should redirect to / for invalid roomId', () => {
      renderApp('/waiting-room/invalid');
      expect(screen.getByText('Iniciar Partida')).toBeInTheDocument();
    });

    it('should initialize waiting room and show empty player list', () => {
      renderApp(`/waiting-room/${VALID_ROOM_ID}`);
      expect(screen.getByRole('heading', { name: 'Sala de Espera' })).toBeInTheDocument();
      expect(screen.getByText('Nenhum jogador ainda. Adicione o primeiro!')).toBeInTheDocument();
    });

    it('should add a player and show it in the list', async () => {
      const user = userEvent.setup();
      renderApp(`/waiting-room/${VALID_ROOM_ID}`);
      const input = screen.getByPlaceholderText('Nome do jogador...');
      await user.type(input, 'Alice');
      await user.keyboard('{Enter}');
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should navigate to game when Create Game is clicked with enough players', async () => {
      const user = userEvent.setup();
      useGameStore.getState().initWaitingRoom(VALID_ROOM_ID);
      useGameStore.getState().addWaitingRoomPlayer(VALID_ROOM_ID, 'Alice');
      useGameStore.getState().addWaitingRoomPlayer(VALID_ROOM_ID, 'Bob');
      renderApp(`/waiting-room/${VALID_ROOM_ID}`);
      await user.click(screen.getByRole('button', { name: 'Criar partida com os jogadores da sala de espera' }));
      expect(mockNavigate).toHaveBeenCalledWith(`/game/${VALID_ROOM_ID}`);
    });
  });

  describe('GamePage', () => {
    it('should redirect to / for invalid gameId', () => {
      renderApp('/game/invalid');
      expect(screen.getByText('Iniciar Partida')).toBeInTheDocument();
    });

    it('should initialize game and show empty player list', () => {
      renderApp(`/game/${VALID_GAME_ID}`);
      expect(screen.getByRole('heading', { name: 'Jogadores' })).toBeInTheDocument();
      expect(screen.getByText('Nenhum jogador ainda')).toBeInTheDocument();
    });

    it('should add a player and show it in the list', async () => {
      const user = userEvent.setup();
      renderApp(`/game/${VALID_GAME_ID}`);
      const input = screen.getByPlaceholderText('Digite o nome do jogador...');
      await user.type(input, 'Alice');
      await user.keyboard('{Enter}');
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should persist player to store', async () => {
      const user = userEvent.setup();
      renderApp(`/game/${VALID_GAME_ID}`);
      const input = screen.getByPlaceholderText('Digite o nome do jogador...');
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
      await user.click(screen.getByRole('button', { name: 'Sortear Times' }));
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
      expect(screen.getByRole('heading', { name: 'Resultado dos Times' })).toBeInTheDocument();
      expect(screen.getByText('2 jogadores sorteados em 2 times')).toBeInTheDocument();
    });

    it('should navigate back to game when Back to Game is clicked', async () => {
      const user = userEvent.setup();
      renderApp(`/results/${VALID_GAME_ID}`);
      await user.click(screen.getByRole('button', { name: 'Voltar ao Jogo' }));
      expect(mockNavigate).toHaveBeenCalledWith(`/game/${VALID_GAME_ID}`);
    });
  });
});
