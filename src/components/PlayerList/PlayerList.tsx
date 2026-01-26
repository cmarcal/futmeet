import { Users } from 'lucide-react';
import { PlayerCard } from '../PlayerCard';
import type { Player } from '../../types';
import styles from './PlayerList.module.css';

export interface PlayerListProps {
  players: Player[];
  onTogglePriority?: (playerId: string) => void;
  onRemove?: (playerId: string) => void;
  showActions?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
}

export const PlayerList = ({
  players,
  onTogglePriority,
  onRemove,
  showActions = true,
  emptyMessage = 'No players yet',
  emptySubMessage = 'Add your first player to get started',
}: PlayerListProps) => {
  if (players.length === 0) {
    return (
      <div className={styles.empty}>
        <Users size={64} className={styles.emptyIcon} aria-hidden="true" />
        <p className={styles.emptyMessage}>{emptyMessage}</p>
        <p className={styles.emptySubMessage}>{emptySubMessage}</p>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {players.map((player, index) => (
        <li key={player.id}>
          <PlayerCard
            player={player}
            index={index}
            onTogglePriority={onTogglePriority}
            onRemove={onRemove}
            showActions={showActions}
          />
        </li>
      ))}
    </ul>
  );
};
