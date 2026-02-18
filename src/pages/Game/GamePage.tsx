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
            <h1 className={styles.title}>Players</h1>
            <p className={styles.subtitle}>Manage your game roster</p>
          </div>
          <Button variant="secondary" size="small" onClick={handleNewGame} className={styles.newGameButton}>
            New Game
          </Button>
        </header>

        <section className={styles.addPlayerSection}>
          <div className={styles.addPlayerCard}>
            <h2 className={styles.sectionTitle}>Add New Player</h2>
            <PlayerInput onSubmit={handleAddPlayer} disabled={gameStatus === 'sorting'} placeholder="Enter player name..." />
          </div>
        </section>

        <section className={styles.teamSettingsSection}>
          {showMaxTeamsWarning && (
            <Alert variant="warning" className={styles.teamWarningAlert}>
              Maximum number of teams is 10.
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

        <section className={styles.playerListSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Player List</h2>
            <span className={styles.sortIndicator}>Arrival order</span>
          </div>
          <PlayerList
            players={players}
            onTogglePriority={togglePriority}
            onRemove={removePlayer}
            onReorder={reorderPlayers}
            showActions={gameStatus !== 'sorting'}
            emptyMessage="No players yet"
          />
        </section>

        <section className={styles.actionsSection}>
          {!canSort && players.length > 0 && (
            <Alert variant="warning" className={styles.warningAlert}>
              Add at least {teamCount} players to sort into teams.
            </Alert>
          )}
          <Button
            variant="primary"
            size="large"
            onClick={handleViewResults}
            disabled={!canSort}
            className={styles.sortButton}
          >
            Sort Teams
          </Button>
        </section>
      </div>
    </Layout>
  );
};

export default GamePage;
