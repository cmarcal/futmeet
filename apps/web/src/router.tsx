import { createRouter, type ErrorComponentProps } from '@tanstack/react-router';
import { ErrorFallback } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { routeTree } from './routeTree.gen';

const DefaultErrorComponent = ({ error, reset }: ErrorComponentProps) => (
  <ErrorFallback error={error} resetErrorBoundary={reset} />
);

const router = createRouter({
  routeTree,
  defaultPendingComponent: LoadingSpinner,
  defaultErrorComponent: DefaultErrorComponent,
  defaultPendingMs: 0,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export { router };
