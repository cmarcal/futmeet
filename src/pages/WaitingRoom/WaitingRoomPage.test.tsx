import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import WaitingRoomPage from './WaitingRoomPage';

const VALID_ROOM_ID = 'V1StGXR8_Z5jdHi6B-myT';

const mockNavigate = vi.fn();
const mockOpen = vi.fn();
const mockShare = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  mockNavigate.mockClear();
  mockOpen.mockClear();
  mockShare.mockClear();
  useGameStore.setState({ waitingRooms: {} });
  Object.defineProperty(globalThis, 'open', { value: mockOpen, writable: true });
  Object.defineProperty(globalThis.navigator, 'share', {
    value: mockShare,
    writable: true,
    configurable: true,
  });
});

const renderWaitingRoomPage = (roomId = VALID_ROOM_ID) => {
  return render(
    <MemoryRouter initialEntries={[`/waiting-room/${roomId}`]}>
      <Routes>
        <Route path="/waiting-room/:roomId" element={<WaitingRoomPage />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('WaitingRoomPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useGameStore.setState({ waitingRooms: {} });
  });

  it('should render page title and subtitle', () => {
    renderWaitingRoomPage();

    expect(screen.getByRole('heading', { name: 'Sala de Espera' })).toBeInTheDocument();
    expect(screen.getByText('Adicione jogadores antes do dia do jogo')).toBeInTheDocument();
  });

  it('should render Início back button', () => {
    renderWaitingRoomPage();

    expect(screen.getByRole('button', { name: 'Voltar para página inicial' })).toBeInTheDocument();
  });

  it('should render Add New Player section', () => {
    renderWaitingRoomPage();

    expect(screen.getByRole('heading', { name: 'Adicionar Jogador' })).toBeInTheDocument();
  });

  it('should render Player List section', () => {
    renderWaitingRoomPage();

    expect(screen.getByRole('heading', { name: 'Lista de Jogadores' })).toBeInTheDocument();
    expect(screen.getByText('Nenhum jogador ainda. Adicione o primeiro!')).toBeInTheDocument();
  });

  it('should render Share on WhatsApp and Create Game buttons', () => {
    renderWaitingRoomPage();

    expect(screen.getByRole('button', { name: 'Compartilhar sala de espera via WhatsApp' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar partida com os jogadores da sala de espera' })).toBeInTheDocument();
  });

  it('should have Create Game button disabled when fewer than 2 players', () => {
    renderWaitingRoomPage();

    const createButton = screen.getByRole('button', { name: 'Criar partida com os jogadores da sala de espera' });
    expect(createButton).toBeDisabled();
  });

  it('should add a player and show it in the list', async () => {
    const user = userEvent.setup();
    renderWaitingRoomPage();

    const input = screen.getByPlaceholderText('Nome do jogador...');
    await user.type(input, 'Alice');
    await user.keyboard('{Enter}');

    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('should persist player to store', async () => {
    const user = userEvent.setup();
    renderWaitingRoomPage();

    const input = screen.getByPlaceholderText('Nome do jogador...');
    await user.type(input, 'Bob');
    await user.keyboard('{Enter}');

    const players = useGameStore.getState().waitingRooms[VALID_ROOM_ID];
    expect(players?.some((p) => p.name === 'Bob')).toBe(true);
  });

  it('should navigate to home when Início is clicked', async () => {
    const user = userEvent.setup();
    renderWaitingRoomPage();

    await user.click(screen.getByRole('button', { name: 'Voltar para página inicial' }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should navigate to game when Create Game is clicked with enough players', async () => {
    const user = userEvent.setup();
    useGameStore.getState().initWaitingRoom(VALID_ROOM_ID);
    useGameStore.getState().addWaitingRoomPlayer(VALID_ROOM_ID, 'Alice');
    useGameStore.getState().addWaitingRoomPlayer(VALID_ROOM_ID, 'Bob');
    renderWaitingRoomPage();

    await user.click(screen.getByRole('button', { name: 'Criar partida com os jogadores da sala de espera' }));

    expect(mockNavigate).toHaveBeenCalledWith(`/game/${VALID_ROOM_ID}`);
    const game = useGameStore.getState().games[VALID_ROOM_ID];
    expect(game?.players).toHaveLength(2);
  });

  it('should redirect to / when roomId is invalid', () => {
    renderWaitingRoomPage('invalid-id');

    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
