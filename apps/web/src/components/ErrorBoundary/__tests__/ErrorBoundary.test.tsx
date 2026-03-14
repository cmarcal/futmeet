import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ErrorBoundary } from '..';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) throw new Error('Test error');
  return <div>No error</div>;
};

const renderWithError = () => {
  return render(
    <MemoryRouter>
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    </MemoryRouter>
  );
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <div>Safe content</div>
        </ErrorBoundary>
      </MemoryRouter>
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('should render error fallback when an error is thrown', () => {
    renderWithError();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
  });

  it('should display Try Again button', () => {
    renderWithError();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
  });

  it('should display Go to Home button', () => {
    renderWithError();
    expect(screen.getByRole('button', { name: 'Ir para a página inicial' })).toBeInTheDocument();
  });

  it('should navigate to / when Go to Home is clicked', async () => {
    const user = userEvent.setup();
    renderWithError();
    await user.click(screen.getByRole('button', { name: 'Ir para a página inicial' }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
