import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from './Alert';

describe('Alert', () => {
  it('should render with children', () => {
    render(<Alert>Test message</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Test message');
  });

  it('should render with info variant by default', () => {
    const { container } = render(<Alert>Info alert</Alert>);
    const alert = container.querySelector('[role="alert"]');
    expect(alert?.className).toContain('alert');
    expect(alert?.className).toContain('info');
  });

  it('should render with different variants', () => {
    const { container: errorContainer } = render(<Alert variant="error">Error</Alert>);
    const { container: successContainer } = render(<Alert variant="success">Success</Alert>);
    const { container: warningContainer } = render(<Alert variant="warning">Warning</Alert>);

    expect(errorContainer.querySelector('[role="alert"]')?.className).toContain('error');
    expect(successContainer.querySelector('[role="alert"]')?.className).toContain('success');
    expect(warningContainer.querySelector('[role="alert"]')?.className).toContain('warning');
  });

  it('should show close button when onClose is provided', () => {
    const handleClose = vi.fn();
    render(<Alert onClose={handleClose}>Closable alert</Alert>);
    expect(screen.getByLabelText('Close alert')).toBeInTheDocument();
  });

  it('should not show close button when onClose is not provided', () => {
    render(<Alert>Non-closable alert</Alert>);
    expect(screen.queryByLabelText('Close alert')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(<Alert onClose={handleClose}>Closable alert</Alert>);
    await user.click(screen.getByLabelText('Close alert'));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
