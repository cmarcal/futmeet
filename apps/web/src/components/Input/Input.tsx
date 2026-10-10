import React from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.ComponentPropsWithRef<'input'> {
  error?: boolean;
  errorMessage?: string;
}

export const Input = ({ error = false, errorMessage, className = '', ref, ...props }: InputProps) => {
  const inputClasses = [styles.input, error && styles.error, className].filter(Boolean).join(' ');

  return (
    <div className={styles.wrapper}>
      <input
        ref={ref}
        className={inputClasses}
        aria-invalid={error}
        aria-describedby={error && errorMessage ? `${props.id || 'input'}-error` : undefined}
        {...props}
      />
      {error && errorMessage && (
        <span id={props.id ? `${props.id}-error` : 'input-error'} className={styles.errorMessage} role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  );
};
