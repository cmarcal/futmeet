import React from 'react';
import styles from './Badge.module.css';

export type BadgeVariant = 'default' | 'priority' | 'success' | 'error';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'default', className = '', children, ...props }) => {
  const badgeClasses = [
    styles.badge,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={badgeClasses}
      {...props}
    >
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export default Badge;
