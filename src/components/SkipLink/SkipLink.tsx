import styles from './SkipLink.module.css';

export const SkipLink = () => {
  return (
    <a href="#main-content" className={styles.skipLink}>
      Pular para o conteúdo principal
    </a>
  );
};
