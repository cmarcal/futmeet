import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerInput } from './PlayerInput';

describe('PlayerInput', () => {
  it('should render input and button', () => {
    const handleSubmit = vi.fn();
    render(<PlayerInput onSubmit={handleSubmit} />);
    expect(screen.getByLabelText('Nome do jogador')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adicionar jogador/i })).toBeInTheDocument();
  });

  it('should call onSubmit with player name when form is submitted', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<PlayerInput onSubmit={handleSubmit} />);
    await user.type(screen.getByLabelText('Nome do jogador'), 'John Doe');
    await user.click(screen.getByRole('button', { name: /adicionar jogador/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith('John Doe');
    });
  });

  it('should clear input after successful submission', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<PlayerInput onSubmit={handleSubmit} />);
    const input = screen.getByLabelText('Nome do jogador');
    await user.type(input, 'John Doe');
    await user.click(screen.getByRole('button', { name: /adicionar jogador/i }));

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('should submit form when Enter key is pressed', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<PlayerInput onSubmit={handleSubmit} />);
    const input = screen.getByLabelText('Nome do jogador');
    await user.type(input, 'John Doe{Enter}');

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith('John Doe');
    });
  });

  it('should show validation error for empty name', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<PlayerInput onSubmit={handleSubmit} />);
    await user.click(screen.getByRole('button', { name: /adicionar jogador/i }));

    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('should show validation error for name with only whitespace', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<PlayerInput onSubmit={handleSubmit} />);
    await user.type(screen.getByLabelText('Nome do jogador'), '   ');
    await user.click(screen.getByRole('button', { name: /adicionar jogador/i }));

    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    const handleSubmit = vi.fn();
    render(<PlayerInput onSubmit={handleSubmit} disabled />);
    expect(screen.getByLabelText('Nome do jogador')).toBeDisabled();
    expect(screen.getByRole('button', { name: /adicionar jogador/i })).toBeDisabled();
  });

  it('should use custom placeholder', () => {
    const handleSubmit = vi.fn();
    render(<PlayerInput onSubmit={handleSubmit} placeholder="Enter name here" />);
    expect(screen.getByPlaceholderText('Enter name here')).toBeInTheDocument();
  });

  it('should reject name with < or > (XSS defense-in-depth)', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<PlayerInput onSubmit={handleSubmit} />);
    await user.type(screen.getByLabelText('Nome do jogador'), '<script>alert(1)</script>');
    await user.click(screen.getByRole('button', { name: /adicionar jogador/i }));

    await waitFor(() => {
      expect(screen.getByText(/não pode conter os caracteres/i)).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
