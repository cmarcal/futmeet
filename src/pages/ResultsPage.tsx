import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
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
    <Layout>
      <h1 className={styles.title}>Team Results</h1>
      <p className={styles.placeholder}>Teams will be displayed here</p>
      <div className={styles.buttonGroup}>
        <Button variant="primary" size="medium" onClick={handleNewGame}>
          New Game
        </Button>
        <Button variant="secondary" size="medium" onClick={handleBackToGame}>
          Back to Game
        </Button>
      </div>
    </Layout>
  );
};

export default ResultsPage;
