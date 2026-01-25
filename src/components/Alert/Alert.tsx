import React from 'react';
import { X } from 'lucide-react';
import styles from './Alert.module.css';

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert = ({ variant = 'info', children, onClose, className = '' }: AlertProps) => {
  const alertClasses = [
    styles.alert,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClose();
    }
  };

  return (
    <div
      role="alert"
      className={alertClasses}
    >
      <div className={styles.content}>
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={handleClose}
          onKeyDown={handleKeyDown}
          className={styles.closeButton}
          aria-label="Close alert"
          tabIndex={0}
        >
          <X size={20} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default Alert;
