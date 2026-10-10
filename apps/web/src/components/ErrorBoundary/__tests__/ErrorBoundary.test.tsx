import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test/renderWithRouter';
import { ErrorBoundary } from '..';

const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) throw new Error('Test error');
  return <div>No error</div>;
};

const renderWithError = () => {
  return renderWithRouter(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>,
    { path: '/broken' }
  );
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when there is no error', async () => {
    await renderWithRouter(
      <ErrorBoundary>
        <div>Safe content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('should render error fallback when an error is thrown', async () => {
    await renderWithError();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
  });

  it('should display Try Again button', async () => {
    await renderWithError();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
  });

  it('should display Go to Home button', async () => {
    await renderWithError();
    expect(screen.getByRole('button', { name: 'Ir para a página inicial' })).toBeInTheDocument();
  });

  it('should navigate to / when Go to Home is clicked', async () => {
    const user = userEvent.setup();
    const { router } = await renderWithError();
    await user.click(screen.getByRole('button', { name: 'Ir para a página inicial' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
  });
});
