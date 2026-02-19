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
        <h1 className={styles.title}>Algo deu errado</h1>
        <p className={styles.message}>{getErrorMessage(error)}</p>
        <div className={styles.details}>
          <p className={styles.errorType}>
            <strong>Erro:</strong> {error instanceof Error ? error.name : 'UnknownError'}
          </p>
          <p className={styles.timestamp}>
            <strong>Horário:</strong> {timestamp}
          </p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={resetErrorBoundary}
            aria-label="Tentar novamente"
          >
            Tentar Novamente
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleGoHome}
            aria-label="Ir para a página inicial"
          >
            Ir para Início
          </button>
        </div>
      </div>
    </div>
  );
};

export { ErrorFallback };
export default ErrorFallback;
