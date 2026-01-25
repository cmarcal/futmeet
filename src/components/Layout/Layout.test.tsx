import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Layout } from './Layout';

describe('Layout', () => {
  it('should render children', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Layout className="custom-layout">
        <div>Content</div>
      </Layout>
    );
    const layout = container.firstChild;
    expect(layout).toHaveClass('custom-layout');
  });

  it('should render multiple children', () => {
    render(
      <Layout>
        <div>Child 1</div>
        <div>Child 2</div>
      </Layout>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});
