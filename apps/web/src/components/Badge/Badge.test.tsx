import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('should render with children', () => {
    render(<Badge>Badge text</Badge>);
    expect(screen.getByText('Badge text')).toBeInTheDocument();
  });

  it('should render with default variant', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('badge');
    expect(badge?.className).toContain('default');
  });

  it('should render with priority variant', () => {
    const { container } = render(<Badge variant="priority">Priority</Badge>);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('badge');
    expect(badge?.className).toContain('priority');
  });

  it('should render with success variant', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('badge');
    expect(badge?.className).toContain('success');
  });

  it('should render with error variant', () => {
    const { container } = render(<Badge variant="error">Error</Badge>);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('badge');
    expect(badge?.className).toContain('error');
  });

  it('should apply custom className', () => {
    const { container } = render(<Badge className="custom-class">Badge</Badge>);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('custom-class');
  });
});
