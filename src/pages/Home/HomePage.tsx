import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { generateGameId } from '../../utils/gameId';
import styles from './HomePage.module.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    const gameId = generateGameId();
    navigate(`/game/${gameId}`);
  };

  const handleOpenWaitingRoom = () => {
    const roomId = generateGameId();
    navigate(`/waiting-room/${roomId}`);
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>FutMeet</h1>
        <p className={styles.subtitle}>Organize your pickup games</p>
        <Button variant="primary" size="large" onClick={handleStartGame}>
          Start Game
        </Button>
        <button
          type="button"
          className={styles.waitingRoomLink}
          onClick={handleOpenWaitingRoom}
          aria-label="Sala de Espera"
        >
          ⏳ Sala de Espera
        </button>
      </div>
    </Layout>
  );
};

export default HomePage;
