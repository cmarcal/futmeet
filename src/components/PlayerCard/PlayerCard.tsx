import { GripVertical, Star, X } from 'lucide-react';
import type { Player } from '../../types';
import styles from './PlayerCard.module.css';

export interface PlayerCardProps {
  player: Player;
  index: number;
  onTogglePriority?: (playerId: string) => void;
  onRemove?: (playerId: string) => void;
  showActions?: boolean;
}

export const PlayerCard = ({
  player,
  index,
  onTogglePriority,
  onRemove,
  showActions = true,
}: PlayerCardProps) => {
  const handleTogglePriority = () => {
    onTogglePriority?.(player.id);
  };

  const handleRemove = () => {
    onRemove?.(player.id);
  };

  return (
    <div className={styles.card} data-priority={player.priority}>
      {showActions && (
        <button
          type="button"
          className={styles.reorderHandle}
          aria-label="Drag to reorder player"
          tabIndex={-1}
          draggable={false}
        >
          <GripVertical size={20} aria-hidden="true" />
        </button>
      )}
      <div className={styles.badge}>
        <span className={styles.badgeNumber}>{index + 1}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{player.name}</span>
        </div>
      </div>
      {showActions && (
        <div className={styles.actions}>
          {onTogglePriority && (
            <button
              type="button"
              onClick={handleTogglePriority}
              className={`${styles.priorityButton} ${player.priority ? styles.priorityButtonActive : ''}`}
              aria-label={player.priority ? 'Remove priority' : 'Mark as priority'}
              aria-pressed={player.priority}
            >
              <Star
                size={20}
                className={player.priority ? styles.starActive : styles.starInactive}
                aria-hidden="true"
                fill={player.priority ? 'currentColor' : 'none'}
              />
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={handleRemove}
              className={styles.removeButton}
              aria-label={`Remove ${player.name}`}
            >
              <X size={20} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
