import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { PlayerInput } from '../../components/PlayerInput';
import { PlayerList } from '../../components/PlayerList';
import { PlayerStatistics } from '../../components/PlayerStatistics';
import { Alert } from '../../components/Alert';
import { useWaitingRoom } from '../../hooks/useWaitingRoom';
import styles from './WaitingRoomPage.module.css';

const WaitingRoomPage = () => {
  const navigate = useNavigate();
  const { players, addPlayer, removePlayer, togglePriority, reorderPlayers, clearWaitingRoom, createGameFromWaitingRoom } =
    useWaitingRoom();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleAddPlayer = (name: string) => {
    addPlayer(name);
  };

  const handleStartGame = () => {
    if (players.length === 0) return;
    const gameId = createGameFromWaitingRoom();
    navigate(`/game/${gameId}`);
  };

  const handleShareWhatsApp = () => {
    const playerLines = players.map((p, i) => `${i + 1}. ${p.name}${p.priority ? ' ⭐' : ''}`).join('\n');
    const playerLabel = players.length === 1 ? 'confirmado' : 'confirmados';
    const text = `⚽ *FutMeet - Sala de Espera*\n\nQuem vai jogar? (${players.length} ${playerLabel})\n\n${playerLines}\n\n_Confirme sua presença antes do jogo!_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleClearRequest = () => {
    setShowClearConfirm(true);
  };

  const handleClearConfirm = () => {
    clearWaitingRoom();
    setShowClearConfirm(false);
  };

  const handleClearCancel = () => {
    setShowClearConfirm(false);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Sala de Espera</h1>
            <p className={styles.subtitle}>Adicione jogadores antes do dia do jogo</p>
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={handleBack}
            className={styles.backButton}
            aria-label="Voltar para página inicial"
          >
            ← Início
          </Button>
        </header>

        <section className={styles.addPlayerSection} aria-label="Adicionar jogador">
          <div className={styles.addPlayerCard}>
            <h2 className={styles.sectionTitle}>Adicionar Jogador</h2>
            <PlayerInput onSubmit={handleAddPlayer} placeholder="Nome do jogador..." />
          </div>
        </section>

        {players.length > 0 && (
          <section className={styles.statisticsSection} aria-label="Estatísticas dos jogadores">
            <PlayerStatistics players={players} />
          </section>
        )}

        {showClearConfirm && (
          <Alert variant="warning" className={styles.clearConfirmAlert}>
            <div className={styles.clearConfirmContent}>
              <span>Remover todos os jogadores da lista?</span>
              <div className={styles.clearConfirmActions}>
                <Button variant="secondary" size="small" onClick={handleClearCancel}>
                  Cancelar
                </Button>
                <Button variant="primary" size="small" onClick={handleClearConfirm}>
                  Remover todos
                </Button>
              </div>
            </div>
          </Alert>
        )}

        <output aria-live="polite" aria-atomic="true" className={styles.srOnly}>
          {players.length} {players.length === 1 ? 'jogador' : 'jogadores'} na sala de espera
        </output>

        <section className={styles.playerListSection} aria-label="Lista de jogadores">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Lista de Jogadores
              {players.length > 0 && (
                <span className={styles.playerCount} aria-label={`${players.length} jogadores`}>
                  {players.length}
                </span>
              )}
            </h2>
            {players.length > 0 && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClearRequest}
                aria-label="Limpar lista de jogadores"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleClearRequest()}
              >
                Limpar lista
              </button>
            )}
          </div>
          <PlayerList
            players={players}
            onTogglePriority={togglePriority}
            onRemove={removePlayer}
            onReorder={reorderPlayers}
            showActions
            emptyMessage="Nenhum jogador ainda. Adicione o primeiro!"
          />
        </section>

        <section className={styles.actionsSection} aria-label="Ações">
          {players.length === 0 && (
            <Alert variant="warning" className={styles.warningAlert}>
              Adicione ao menos 2 jogadores para iniciar uma partida.
            </Alert>
          )}
          <div className={styles.actionButtons}>
            <Button
              variant="secondary"
              size="large"
              onClick={handleShareWhatsApp}
              disabled={players.length === 0}
              className={styles.shareButton}
              aria-label={`Compartilhar lista com ${players.length} jogadores via WhatsApp`}
            >
              <span aria-hidden="true">📲</span> Compartilhar no WhatsApp
            </Button>
            <Button
              variant="primary"
              size="large"
              onClick={handleStartGame}
              disabled={players.length < 2}
              className={styles.startGameButton}
              aria-label="Criar partida com os jogadores da sala de espera"
            >
              Criar Partida
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default WaitingRoomPage;
