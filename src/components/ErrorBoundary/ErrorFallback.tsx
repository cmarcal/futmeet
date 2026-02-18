import type { FallbackProps } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../utils/errorMessages';
import styles from './ErrorFallback.module.css';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const navigate = useNavigate();
  const timestamp = new Date().toLocaleTimeString();

  const handleGoHome = () => {
    resetErrorBoundary();
    navigate('/');
  };

  return (
    <div className={styles.container} role="alert">
      <div className={styles.card}>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.message}>{getErrorMessage(error)}</p>
        <div className={styles.details}>
          <p className={styles.errorType}>
            <strong>Error:</strong> {error.name}
          </p>
          <p className={styles.timestamp}>
            <strong>Time:</strong> {timestamp}
          </p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={resetErrorBoundary}
            aria-label="Try again"
          >
            Try Again
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleGoHome}
            aria-label="Go to home page"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export { ErrorFallback };
export default ErrorFallback;
