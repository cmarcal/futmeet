import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { TeamList } from '../components/TeamList';
import { useGameStore } from '../stores/gameStore';
import styles from './ResultsPage.module.css';

const ResultsPage = () => {
  const navigate = useNavigate();
  const { teams, players, reset } = useGameStore();

  const handleNewGame = () => {
    reset();
    navigate('/');
  };

  const handleBackToGame = () => {
    navigate('/game');
  };

  return (
    <Layout>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Team Results</h1>
          <p className={styles.subtitle}>
            {players.length} player{players.length !== 1 ? 's' : ''} sorted into {teams.length} team
            {teams.length !== 1 ? 's' : ''}
          </p>
        </header>

        <section className={styles.teamsSection}>
          <TeamList teams={teams} showPlayerActions={false} />
        </section>

        <div className={styles.actions}>
          <Button variant="primary" size="large" onClick={handleNewGame} className={styles.button}>
            New Game
          </Button>
          <Button variant="secondary" size="large" onClick={handleBackToGame} className={styles.button}>
            Back to Game
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ResultsPage;
