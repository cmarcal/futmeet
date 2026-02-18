import { memo } from 'react';
import { GripVertical, Star, X } from 'lucide-react';
import type { Player } from '../../types';
import styles from './PlayerCard.module.css';

export interface PlayerCardProps {
  player: Player;
  index: number;
  onTogglePriority?: (playerId: string) => void;
  onRemove?: (playerId: string) => void;
  showActions?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  isDragging?: boolean;
}

export const PlayerCard = memo(({
  player,
  index,
  onTogglePriority,
  onRemove,
  showActions = true,
  draggable = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onTouchStart,
  isDragging = false,
}: PlayerCardProps) => {
  const handleTogglePriority = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePriority?.(player.id);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.(player.id);
  };

  const handleButtonMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCardDragStart = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      e.preventDefault();
      return;
    }
    onDragStart?.(e);
  };

  return (
    <div
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
      data-priority={player.priority}
      draggable={draggable}
      onDragStart={handleCardDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onTouchStart={onTouchStart}
    >
      {showActions && (
        <button
          type="button"
          className={styles.reorderHandle}
          aria-label="Drag to reorder player"
          tabIndex={-1}
          draggable={false}
          onMouseDown={handleButtonMouseDown}
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
              onMouseDown={handleButtonMouseDown}
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
              onMouseDown={handleButtonMouseDown}
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
}, (prev, next) =>
  prev.player.id === next.player.id &&
  prev.player.name === next.player.name &&
  prev.player.priority === next.player.priority &&
  prev.index === next.index &&
  prev.showActions === next.showActions &&
  prev.isDragging === next.isDragging
);
