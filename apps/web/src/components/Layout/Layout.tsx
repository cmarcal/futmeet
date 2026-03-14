import { SkipLink } from '../SkipLink';
import styles from './Layout.module.css';

export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout = ({ children, className = '' }: LayoutProps) => {
  const containerClasses = [styles.container, className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <SkipLink />
      <main id="main-content" className={styles.content}>
        {children}
      </main>
    </div>
  );
};
