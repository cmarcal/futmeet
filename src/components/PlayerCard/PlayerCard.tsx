import { Star, X } from 'lucide-react';
import { Badge } from '../Badge';
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
      <div className={styles.content}>
        <div className={styles.order}>
          <span className={styles.orderNumber}>{index + 1}</span>
        </div>
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{player.name}</span>
            {player.priority && (
              <Badge variant="priority" className={styles.priorityBadge}>
                <Star size={12} aria-hidden="true" />
                Priority
              </Badge>
            )}
          </div>
          {player.notes && <p className={styles.notes}>{player.notes}</p>}
        </div>
      </div>
      {showActions && (
        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleTogglePriority}
            className={styles.priorityButton}
            aria-label={player.priority ? 'Remove priority' : 'Mark as priority'}
            aria-pressed={player.priority}
          >
            <Star
              size={20}
              className={player.priority ? styles.starActive : styles.starInactive}
              aria-hidden="true"
            />
          </button>
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
