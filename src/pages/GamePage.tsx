import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { PlayerInput } from '../components/PlayerInput';
import { PlayerList } from '../components/PlayerList';
import { TeamSettings } from '../components/TeamSettings';
import { Alert } from '../components/Alert';
import { useGameStore } from '../stores/gameStore';
import styles from './GamePage.module.css';

const GamePage = () => {
  const navigate = useNavigate();
  const { players, teamCount, gameStatus, addPlayer, removePlayer, togglePriority, setTeamCount, sortTeams, reset } =
    useGameStore();

  const handleAddPlayer = (name: string) => {
    addPlayer(name);
  };

  const handleViewResults = () => {
    if (players.length < teamCount) {
      return;
    }
    sortTeams();
    navigate('/results');
  };

  const handleNewGame = () => {
    reset();
    navigate('/');
  };

  const canSort = players.length >= teamCount && gameStatus !== 'sorting';

  return (
    <Layout>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Player Management</h1>
          <Button variant="secondary" size="small" onClick={handleNewGame}>
            New Game
          </Button>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Add Players</h2>
          <PlayerInput onSubmit={handleAddPlayer} disabled={gameStatus === 'sorting'} />
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Players ({players.length})
            </h2>
          </div>
          <PlayerList
            players={players}
            onTogglePriority={togglePriority}
            onRemove={removePlayer}
            showActions={gameStatus !== 'sorting'}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Team Settings</h2>
          <TeamSettings
            teamCount={teamCount}
            onTeamCountChange={setTeamCount}
            disabled={gameStatus === 'sorting' || players.length > 0}
          />
          {players.length > 0 && (
            <Alert variant="info" className={styles.infoAlert}>
              Team count cannot be changed after players are added. Reset the game to change team count.
            </Alert>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.actions}>
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
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default GamePage;
