import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  HeadContent: () => <meta name="head-content" />,
  Scripts: () => <script data-testid="scripts" />,
  Outlet: () => <p>outlet</p>,
}));

vi.mock('../../styles/global.css?url', () => ({ default: '/assets/global.css' }));

import { Route } from '../../routes/__root';

describe('root route', () => {
  it('should declare the global stylesheet as a head link', () => {
    const head = (Route.options.head as () => { links: unknown[] })();
    expect(head.links).toEqual([{ rel: 'stylesheet', href: '/assets/global.css' }]);
  });

  it('should declare charset, viewport and default title', () => {
    const head = (Route.options.head as () => { meta: Record<string, string>[] })();
    expect(head.meta).toContainEqual({ charSet: 'utf-8' });
    expect(head.meta).toContainEqual({ name: 'viewport', content: 'width=device-width, initial-scale=1.0' });
    expect(head.meta).toContainEqual({ title: 'FutMeet - Organize Your Pickup Game' });
  });

  it('should render the document shell with head content, root container and scripts', () => {
    const Shell = (Route.options as unknown as { shellComponent: unknown }).shellComponent as (props: { children: ReactNode }) => ReactNode;
    const html = renderToStaticMarkup(<Shell>shell-child</Shell>);

    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<head><meta name="head-content"/></head>');
    expect(html).toContain('<div id="root">shell-child</div>');
    expect(html).toContain('data-testid="scripts"');
  });

  it('should render the outlet inside the error boundary layout', () => {
    const Layout = Route.options.component as () => ReactNode;
    expect(renderToStaticMarkup(<Layout />)).toBe('<p>outlet</p>');
  });
});
