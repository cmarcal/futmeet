import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { TeamList } from '../../components/TeamList';
import { useGame } from '../../hooks/useGame';
import { generateGameId, isValidGameId } from '../../utils/gameId';
import styles from './ResultsPage.module.css';

const ResultsPage = () => {
  const { gameId } = useParams<{ gameId: string }>();

  if (!gameId || !isValidGameId(gameId)) {
    return <Navigate to="/" replace />;
  }

  return <ResultsPageContent gameId={gameId} />;
};

interface ResultsPageContentProps {
  gameId: string;
}

const ResultsPageContent = ({ gameId }: ResultsPageContentProps) => {
  const navigate = useNavigate();
  const { teams, players } = useGame(gameId);

  const handleNewGame = () => {
    const newGameId = generateGameId();
    navigate(`/game/${newGameId}`);
  };

  const handleBackToGame = () => {
    navigate(`/game/${gameId}`);
  };

  return (
    <Layout>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Resultado dos Times</h1>
          <p className={styles.subtitle}>
            {players.length} jogador{players.length === 1 ? '' : 'es'} sorteados em {teams.length} time
            {teams.length === 1 ? '' : 's'}
          </p>
        </header>

        <div role="status" aria-live="polite" aria-atomic="true" className={styles.srOnly}>
          {teams.length > 0
            ? `${teams.length} ${teams.length === 1 ? 'time' : 'times'} pronto${teams.length === 1 ? '' : 's'}`
            : 'Sorteando times...'}
        </div>

        <section className={styles.teamsSection}>
          <TeamList teams={teams} showPlayerActions={false} />
        </section>

        <div className={styles.actions}>
          <Button variant="primary" size="large" onClick={handleNewGame} className={styles.button}>
            Nova Partida
          </Button>
          <Button variant="secondary" size="large" onClick={handleBackToGame} className={styles.button}>
            Voltar ao Jogo
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ResultsPage;

