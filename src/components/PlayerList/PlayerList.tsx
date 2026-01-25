import { PlayerCard } from '../PlayerCard';
import { Alert } from '../Alert';
import type { Player } from '../../types';
import styles from './PlayerList.module.css';

export interface PlayerListProps {
  players: Player[];
  onTogglePriority?: (playerId: string) => void;
  onRemove?: (playerId: string) => void;
  showActions?: boolean;
  emptyMessage?: string;
}

export const PlayerList = ({
  players,
  onTogglePriority,
  onRemove,
  showActions = true,
  emptyMessage = 'No players added yet. Add players to get started!',
}: PlayerListProps) => {
  if (players.length === 0) {
    return (
      <div className={styles.empty}>
        <Alert variant="info">{emptyMessage}</Alert>
      </div>
    );
  }

  return (
    <div className={styles.list} role="list">
      {players.map((player, index) => (
        <div key={player.id} role="listitem">
          <PlayerCard
            player={player}
            index={index}
            onTogglePriority={onTogglePriority}
            onRemove={onRemove}
            showActions={showActions}
          />
        </div>
      ))}
    </div>
  );
};
