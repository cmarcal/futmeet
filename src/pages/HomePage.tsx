import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import styles from './HomePage.module.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/game');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>FutMeet</h1>
        <p className={styles.subtitle}>Organize your pickup games</p>
        <Button 
          variant="primary" 
          size="large" 
          onClick={handleStartGame}
          className={styles.button}
        >
          Start Game
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
