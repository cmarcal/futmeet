import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../test/renderWithRouter';
import { useGameStore } from '../../stores/gameStore';
import GamePage from './GamePage';

const VALID_GAME_ID = 'V1StGXR8_Z5jdHi6B-myT';

const renderGamePage = (gameId = VALID_GAME_ID) => {
  return renderWithRouter(<GamePage />, { path: '/game/$gameId', initialEntry: `/game/${gameId}` });
};

describe('GamePage', () => {
  beforeEach(() => {
    useGameStore.setState({ games: {} });
  });

  it('should render page title and subtitle', async () => {
    await renderGamePage();

    expect(screen.getByRole('heading', { name: 'Jogadores' })).toBeInTheDocument();
    expect(screen.getByText('Gerencie sua lista de jogadores')).toBeInTheDocument();
  });

  it('should render New Game button', async () => {
    await renderGamePage();

    expect(screen.getByRole('button', { name: 'Nova Partida' })).toBeInTheDocument();
  });

  it('should render Add New Player section', async () => {
    await renderGamePage();

    expect(screen.getByRole('heading', { name: 'Adicionar Novo Jogador' })).toBeInTheDocument();
  });

  it('should render Player List section', async () => {
    await renderGamePage();

    expect(screen.getByRole('heading', { name: 'Lista de Jogadores' })).toBeInTheDocument();
    expect(screen.getByText('Ordem de chegada')).toBeInTheDocument();
  });

  it('should render Sort Teams button disabled when not enough players', async () => {
    await renderGamePage();

    const sortButton = screen.getByRole('button', { name: 'Sortear Times' });
    expect(sortButton).toBeDisabled();
  });

  it('should navigate to a new game URL when New Game is clicked', async () => {
    const user = userEvent.setup();
    const { router } = await renderGamePage();

    await user.click(screen.getByRole('button', { name: 'Nova Partida' }));

    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/game\/[A-Za-z0-9]{21}$/));
  });

  it('should redirect to / when gameId is invalid', async () => {
    const { router } = await renderGamePage('invalid-id');

    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
  });
});
