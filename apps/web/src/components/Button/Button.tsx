import React from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = ({ variant = 'primary', size = 'medium', className = '', children, ref, ...props }: ButtonProps) => {
  const buttonClasses = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ');

  return (
    <button ref={ref} type={props.type || 'button'} className={buttonClasses} {...props}>
      {children}
    </button>
  );
};
