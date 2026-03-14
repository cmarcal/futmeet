import { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { PlayerInput } from '../../components/PlayerInput';
import { PlayerList } from '../../components/PlayerList';
import { PlayerStatistics } from '../../components/PlayerStatistics';
import { TeamSettings } from '../../components/TeamSettings';
import { Alert } from '../../components/Alert';
import { useGame } from '../../hooks/useGame';
import { generateGameId, isValidGameId } from '../../utils/gameId';
import styles from './GamePage.module.css';

const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();

  if (!gameId || !isValidGameId(gameId)) {
    return <Navigate to="/" replace />;
  }

  return <GamePageContent gameId={gameId} />;
};

interface GamePageContentProps {
  gameId: string;
}

const GamePageContent = ({ gameId }: GamePageContentProps) => {
  const navigate = useNavigate();
  const { players, teamCount, gameStatus, addPlayer, removePlayer, togglePriority, reorderPlayers, setTeamCount, sortTeams } =
    useGame(gameId);
  const [showMaxTeamsWarning, setShowMaxTeamsWarning] = useState(false);

  const handleAddPlayer = (name: string) => {
    addPlayer(name);
  };

  const handleViewResults = () => {
    if (players.length < teamCount) {
      return;
    }
    sortTeams();
    navigate(`/results/${gameId}`);
  };

  const handleNewGame = () => {
    const newGameId = generateGameId();
    navigate(`/game/${newGameId}`);
  };

  const handleMaxTeamsExceeded = () => {
    setShowMaxTeamsWarning(true);
    setTimeout(() => setShowMaxTeamsWarning(false), 3000);
  };

  const canSort = players.length >= teamCount && gameStatus !== 'sorting';

  return (
    <Layout>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Jogadores</h1>
            <p className={styles.subtitle}>Gerencie sua lista de jogadores</p>
          </div>
          <Button variant="secondary" size="small" onClick={handleNewGame} className={styles.newGameButton}>
            Nova Partida
          </Button>
        </header>

        <section className={styles.addPlayerSection}>
          <div className={styles.addPlayerCard}>
            <h2 className={styles.sectionTitle}>Adicionar Novo Jogador</h2>
            <PlayerInput onSubmit={handleAddPlayer} disabled={gameStatus === 'sorting'} placeholder="Digite o nome do jogador..." />
          </div>
        </section>

        <section className={styles.teamSettingsSection}>
          {showMaxTeamsWarning && (
            <Alert variant="warning" className={styles.teamWarningAlert}>
              O número máximo de times é 10.
            </Alert>
          )}
          <TeamSettings
            teamCount={teamCount}
            onTeamCountChange={setTeamCount}
            onMaxTeamsExceeded={handleMaxTeamsExceeded}
            disabled={gameStatus === 'sorting'}
          />
        </section>

        <section className={styles.statisticsSection}>
          <PlayerStatistics players={players} />
        </section>

        <div role="status" aria-live="polite" aria-atomic="true" className={styles.srOnly}>
          {players.length} {players.length === 1 ? 'jogador' : 'jogadores'} no jogo
        </div>

        <section className={styles.playerListSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Lista de Jogadores</h2>
            <span className={styles.sortIndicator}>Ordem de chegada</span>
          </div>
          <PlayerList
            players={players}
            onTogglePriority={togglePriority}
            onRemove={removePlayer}
            onReorder={reorderPlayers}
            showActions={gameStatus !== 'sorting'}
            emptyMessage="Nenhum jogador ainda"
          />
        </section>

        <section className={styles.actionsSection}>
          {!canSort && players.length > 0 && (
            <Alert variant="warning" className={styles.warningAlert}>
              Adicione pelo menos {teamCount} jogadores para sortear os times.
            </Alert>
          )}
          <Button
            variant="primary"
            size="medium"
            onClick={handleViewResults}
            disabled={!canSort}
            className={styles.sortButton}
          >
            Sortear Times
          </Button>
        </section>
      </div>
    </Layout>
  );
};

export default GamePage;

