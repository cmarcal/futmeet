import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import type { ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryProps {
  children: ReactNode;
}

const handleError = (error: Error, errorInfo: { componentStack: string }) => {
  if (import.meta.env.DEV) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }
};

const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export { ErrorBoundary };
export default ErrorBoundary;
