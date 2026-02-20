import styles from './Badge.module.css';

export type BadgeVariant = 'default' | 'priority' | 'success' | 'error';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = ({ variant = 'default', className = '', children, ...props }: BadgeProps) => {
  const badgeClasses = [styles.badge, styles[variant], className].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};
