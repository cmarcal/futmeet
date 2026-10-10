import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ErrorBoundary } from '../components/ErrorBoundary';

const RootLayout = () => (
  <ErrorBoundary>
    <Outlet />
  </ErrorBoundary>
);

export const Route = createRootRoute({ component: RootLayout });
