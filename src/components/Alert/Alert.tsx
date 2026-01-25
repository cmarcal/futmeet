import { X } from 'lucide-react';
import styles from './Alert.module.css';

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert = ({ variant = 'info', children, onClose, className = '' }: AlertProps) => {
  const alertClasses = [styles.alert, styles[variant], className].filter(Boolean).join(' ');

  return (
    <div role="alert" className={alertClasses}>
      <div className={styles.content}>{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close alert"
        >
          <X size={20} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
