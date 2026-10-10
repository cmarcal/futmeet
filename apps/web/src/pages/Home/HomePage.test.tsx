import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../test/renderWithRouter';
import HomePage from './HomePage';

const renderHomePage = () => {
  return renderWithRouter(<HomePage />);
};

describe('HomePage', () => {
  it('should render title and subtitle', async () => {
    await renderHomePage();

    expect(screen.getByRole('heading', { name: 'FutMeet' })).toBeInTheDocument();
    expect(screen.getByText('Organize suas peladas')).toBeInTheDocument();
  });

  it('should render Start Game button', async () => {
    await renderHomePage();

    expect(screen.getByRole('button', { name: 'Iniciar Partida' })).toBeInTheDocument();
  });

  it('should navigate to /game/:gameId when Start Game is clicked', async () => {
    const user = userEvent.setup();
    const { router } = await renderHomePage();

    await user.click(screen.getByRole('button', { name: 'Iniciar Partida' }));

    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/game\/[A-Za-z0-9_-]{21}$/));
  });

  it('should render Sala de Espera link', async () => {
    await renderHomePage();

    expect(screen.getByRole('button', { name: 'Sala de Espera' })).toBeInTheDocument();
  });

  it('should navigate to /waiting-room/:roomId when Sala de Espera is clicked', async () => {
    const user = userEvent.setup();
    const { router } = await renderHomePage();

    await user.click(screen.getByRole('button', { name: 'Sala de Espera' }));

    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/waiting-room\/[A-Za-z0-9_-]{21}$/));
  });
});
