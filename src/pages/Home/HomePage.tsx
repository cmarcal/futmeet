import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { generateGameId } from '../../utils/gameId';
import { useGameStore } from '../../stores/gameStore';
import styles from './HomePage.module.css';

const HomePage = () => {
  const navigate = useNavigate();
  const waitingRoomCount = useGameStore((state) => state.waitingRoomPlayers.length);

  const handleStartGame = () => {
    const gameId = generateGameId();
    navigate(`/game/${gameId}`);
  };

  const handleOpenWaitingRoom = () => {
    navigate('/waiting-room');
  };

  const playerWord = waitingRoomCount === 1 ? 'jogador' : 'jogadores';
  const waitingRoomAriaLabel =
    waitingRoomCount > 0 ? `Sala de Espera — ${waitingRoomCount} ${playerWord}` : 'Sala de Espera';

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
          aria-label={waitingRoomAriaLabel}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleOpenWaitingRoom()}
        >
          ⏳ Sala de Espera
          {waitingRoomCount > 0 && (
            <span className={styles.waitingRoomBadge} aria-hidden="true">
              {waitingRoomCount}
            </span>
          )}
        </button>
      </div>
    </Layout>
  );
};

export default HomePage;
