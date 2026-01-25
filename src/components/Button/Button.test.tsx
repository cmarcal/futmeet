import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button onClick={handleClick} disabled>
        Disabled Button
      </Button>
    );
    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render with primary variant by default', () => {
    const { container } = render(<Button>Button</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('button');
    expect(button?.className).toContain('primary');
  });

  it('should render with secondary variant', () => {
    const { container } = render(<Button variant="secondary">Button</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('button');
    expect(button?.className).toContain('secondary');
  });

  it('should render with danger variant', () => {
    const { container } = render(<Button variant="danger">Button</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('button');
    expect(button?.className).toContain('danger');
  });

  it('should render with different sizes', () => {
    const { container: smallContainer } = render(<Button size="small">Small</Button>);
    const { container: largeContainer } = render(<Button size="large">Large</Button>);

    expect(smallContainer.querySelector('button')?.className).toContain('small');
    expect(largeContainer.querySelector('button')?.className).toContain('large');
  });

  it('should forward ref', () => {
    const ref = { current: null };
    render(<Button ref={ref}>Button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
