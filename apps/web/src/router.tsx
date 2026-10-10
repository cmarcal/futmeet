import { createRouter, type ErrorComponentProps } from '@tanstack/react-router';
import { ErrorFallback } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { routeTree } from './routeTree.gen';

const DefaultErrorComponent = ({ error, reset }: ErrorComponentProps) => (
  <ErrorFallback error={error} resetErrorBoundary={reset} />
);

export const getRouter = () =>
  createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPendingComponent: LoadingSpinner,
    defaultErrorComponent: DefaultErrorComponent,
    defaultPendingMs: 0,
  });

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
