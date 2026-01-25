import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamSettings } from './TeamSettings';

describe('TeamSettings', () => {
  it('should render team count input', () => {
    const handleChange = vi.fn();
    render(<TeamSettings teamCount={2} onTeamCountChange={handleChange} />);
    expect(screen.getByLabelText('Team count')).toBeInTheDocument();
    expect(screen.getByLabelText('Team count')).toHaveValue(2);
  });

  it('should call onTeamCountChange when increment button is clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<TeamSettings teamCount={2} onTeamCountChange={handleChange} />);
    await user.click(screen.getByLabelText('Increase team count'));

    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it('should call onTeamCountChange when decrement button is clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<TeamSettings teamCount={3} onTeamCountChange={handleChange} />);
    await user.click(screen.getByLabelText('Decrease team count'));

    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it('should disable decrement button when at minimum', () => {
    const handleChange = vi.fn();
    render(<TeamSettings teamCount={2} onTeamCountChange={handleChange} minTeams={2} />);
    expect(screen.getByLabelText('Decrease team count')).toBeDisabled();
  });

  it('should disable increment button when at maximum', () => {
    const handleChange = vi.fn();
    render(<TeamSettings teamCount={10} onTeamCountChange={handleChange} maxTeams={10} />);
    expect(screen.getByLabelText('Increase team count')).toBeDisabled();
  });

  it('should call onTeamCountChange when input value changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<TeamSettings teamCount={2} onTeamCountChange={handleChange} />);
    const input = screen.getByLabelText('Team count');
    await user.clear(input);
    await user.type(input, '5');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should clamp value to min when input is below minimum', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<TeamSettings teamCount={2} onTeamCountChange={handleChange} minTeams={2} />);
    const input = screen.getByLabelText('Team count') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '1');
    await user.tab(); // Blur to trigger onChange

    // The handler may be called multiple times during typing, check last call
    const calls = handleChange.mock.calls;
    expect(calls[calls.length - 1][0]).toBeGreaterThanOrEqual(2);
  });

  it('should clamp value to max when input is above maximum', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<TeamSettings teamCount={5} onTeamCountChange={handleChange} maxTeams={10} />);
    const input = screen.getByLabelText('Team count');
    await user.clear(input);
    await user.type(input, '15');

    expect(handleChange).toHaveBeenCalledWith(10);
  });

  it('should disable all controls when disabled prop is true', () => {
    const handleChange = vi.fn();
    render(<TeamSettings teamCount={2} onTeamCountChange={handleChange} disabled />);
    expect(screen.getByLabelText('Team count')).toBeDisabled();
    expect(screen.getByLabelText('Decrease team count')).toBeDisabled();
    expect(screen.getByLabelText('Increase team count')).toBeDisabled();
  });

  it('should display hint with min and max values', () => {
    const handleChange = vi.fn();
    render(<TeamSettings teamCount={2} onTeamCountChange={handleChange} minTeams={2} maxTeams={10} />);
    expect(screen.getByText('Teams: 2 - 10')).toBeInTheDocument();
  });
});
