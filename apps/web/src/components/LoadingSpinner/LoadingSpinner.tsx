import styles from './LoadingSpinner.module.css';

const LoadingSpinner = () => {
  return (
    <div className={styles.container} role="status" aria-label="Loading">
      <div className={styles.spinner} aria-hidden="true" />
      <span className={styles.srOnly}>Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
