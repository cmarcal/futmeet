import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Alert } from './Alert';

describe('Alert accessibility', () => {
  it('should have no violations with info variant', async () => {
    const { container } = render(<Alert variant="info">Informational message</Alert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations with warning variant', async () => {
    const { container } = render(<Alert variant="warning">Warning message</Alert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations with error variant', async () => {
    const { container } = render(<Alert variant="error">Error message</Alert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations with success variant', async () => {
    const { container } = render(<Alert variant="success">Success message</Alert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations when closable', async () => {
    const { container } = render(
      <Alert variant="info" onClose={() => {}}>
        Closable alert
      </Alert>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
