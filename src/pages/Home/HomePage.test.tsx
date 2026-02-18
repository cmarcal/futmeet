import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderHomePage = () => {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render title and subtitle', () => {
    renderHomePage();

    expect(screen.getByRole('heading', { name: 'FutMeet' })).toBeInTheDocument();
    expect(screen.getByText('Organize your pickup games')).toBeInTheDocument();
  });

  it('should render Start Game button', () => {
    renderHomePage();

    expect(screen.getByRole('button', { name: 'Start Game' })).toBeInTheDocument();
  });

  it('should navigate to /game when Start Game is clicked', async () => {
    const user = userEvent.setup();
    renderHomePage();

    await user.click(screen.getByRole('button', { name: 'Start Game' }));

    expect(mockNavigate).toHaveBeenCalledWith('/game');
  });
});
