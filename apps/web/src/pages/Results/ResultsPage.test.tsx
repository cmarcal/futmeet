import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../test/renderWithRouter';
import { useGameStore } from '../../stores/gameStore';
import ResultsPage from './ResultsPage';

const VALID_GAME_ID = 'V1StGXR8_Z5jdHi6B-myT';

const renderResultsPage = (gameId = VALID_GAME_ID) => {
  return renderWithRouter(<ResultsPage />, { path: '/results/$gameId', initialEntry: `/results/${gameId}` });
};

describe('ResultsPage', () => {
  beforeEach(() => {
    useGameStore.setState({ games: {} });
  });

  it('should render page title', async () => {
    await renderResultsPage();

    expect(screen.getByRole('heading', { name: 'Resultado dos Times' })).toBeInTheDocument();
  });

  it('should show 0 players and 0 teams when store is empty', async () => {
    await renderResultsPage();

    expect(screen.getByText('0 jogadores sorteados em 0 times')).toBeInTheDocument();
  });

  it('should show player and team count after sort', async () => {
    useGameStore.getState().initGame(VALID_GAME_ID);
    useGameStore.getState().addPlayer(VALID_GAME_ID, 'Alice');
    useGameStore.getState().addPlayer(VALID_GAME_ID, 'Bob');
    useGameStore.getState().sortTeams(VALID_GAME_ID);

    await renderResultsPage();

    expect(screen.getByText('2 jogadores sorteados em 2 times')).toBeInTheDocument();
  });

  it('should render New Game button', async () => {
    await renderResultsPage();

    expect(screen.getByRole('button', { name: 'Nova Partida' })).toBeInTheDocument();
  });

  it('should render Back to Game button', async () => {
    await renderResultsPage();

    expect(screen.getByRole('button', { name: 'Voltar ao Jogo' })).toBeInTheDocument();
  });

  it('should navigate to a new game URL when New Game is clicked', async () => {
    const user = userEvent.setup();
    const { router } = await renderResultsPage();

    await user.click(screen.getByRole('button', { name: 'Nova Partida' }));

    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/game\/[A-Za-z0-9_-]{21}$/));
  });

  it('should navigate to /game/:gameId when Back to Game is clicked', async () => {
    const user = userEvent.setup();
    const { router } = await renderResultsPage();

    await user.click(screen.getByRole('button', { name: 'Voltar ao Jogo' }));

    await waitFor(() => expect(router.state.location.pathname).toBe(`/game/${VALID_GAME_ID}`));
  });

  it('should redirect to / when gameId is invalid', async () => {
    const { router } = await renderResultsPage('invalid-id');

    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
  });
});
