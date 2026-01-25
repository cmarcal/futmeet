import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import styles from './ResultsPage.module.css';

const ResultsPage = () => {
  const navigate = useNavigate();

  const handleNewGame = () => {
    navigate('/');
  };

  const handleBackToGame = () => {
    navigate('/game');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Team Results</h1>
        <p className={styles.placeholder}>Teams will be displayed here</p>
        <div className={styles.buttonGroup}>
          <Button 
            variant="primary" 
            size="medium" 
            onClick={handleNewGame}
            className={styles.button}
          >
            New Game
          </Button>
          <Button 
            variant="secondary" 
            size="medium" 
            onClick={handleBackToGame}
            className={styles.button}
          >
            Back to Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
