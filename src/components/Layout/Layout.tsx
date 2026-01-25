import styles from './Layout.module.css';

export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout = ({ children, className = '' }: LayoutProps) => {
  const containerClasses = [styles.container, className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
