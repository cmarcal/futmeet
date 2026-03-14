import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from './Button';

describe('Button accessibility', () => {
  it('should have no violations with primary variant', async () => {
    const { container } = render(<Button onClick={() => {}}>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations with secondary variant', async () => {
    const { container } = render(
      <Button variant="secondary" onClick={() => {}}>
        Secondary
      </Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations when disabled', async () => {
    const { container } = render(
      <Button disabled onClick={() => {}}>
        Disabled button
      </Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations with danger variant', async () => {
    const { container } = render(
      <Button variant="danger" onClick={() => {}}>
        Delete
      </Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
