import type { ReactNode } from 'react';
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { buildHead } from '../utils/routeHead';
import globalCss from '../styles/global.css?url';

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => (
  <html lang="en">
    <head>
      <HeadContent />
    </head>
    <body>
      <div id="root">{children}</div>
      <Scripts />
    </body>
  </html>
);

const RootLayout = () => (
  <ErrorBoundary>
    <Outlet />
  </ErrorBoundary>
);

export const Route = createRootRoute({
  head: () => {
    const { meta } = buildHead('FutMeet - Organize Your Pickup Game', 'Organize your pickup football games and sort balanced teams.');
    return {
      meta: [{ charSet: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }, ...meta],
      links: [{ rel: 'stylesheet', href: globalCss }],
    };
  },
  shellComponent: RootDocument,
  component: RootLayout,
});
