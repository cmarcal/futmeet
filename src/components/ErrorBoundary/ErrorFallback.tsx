import { useNavigate } from 'react-router-dom';
import type { FallbackProps } from 'react-error-boundary';
import styles from './ErrorFallback.module.css';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const navigate = useNavigate();
  const isDevelopment = import.meta.env.DEV;

  const handleGoHome = () => {
    navigate('/');
    resetErrorBoundary();
  };

  // Safely extract error message and stack
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  return (
    <div role="alert" className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Something went wrong</h1>
        
        {isDevelopment && (
          <div className={styles.errorDetails}>
            <p className={styles.errorMessage}>{errorMessage}</p>
            {errorStack && (
              <pre className={styles.errorStack}>{errorStack}</pre>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={resetErrorBoundary}
            className={styles.button}
            aria-label="Try again"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={handleGoHome}
            className={`${styles.button} ${styles.buttonSecondary}`}
            aria-label="Go to home page"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
