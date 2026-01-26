import { useState } from 'react';
import { Users } from 'lucide-react';
import { PlayerCard } from '../PlayerCard';
import type { Player } from '../../types';
import styles from './PlayerList.module.css';

export interface PlayerListProps {
  players: Player[];
  onTogglePriority?: (playerId: string) => void;
  onRemove?: (playerId: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  showActions?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
}

export const PlayerList = ({
  players,
  onTogglePriority,
  onRemove,
  onReorder,
  showActions = true,
  emptyMessage = 'No players yet',
  emptySubMessage = 'Add your first player to get started',
}: PlayerListProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex && onReorder) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

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
        <li
          key={player.id}
          draggable={showActions && !!onReorder}
          onDragStart={() => handleDragStart(index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          className={`${styles.listItem} ${draggedIndex === index ? styles.dragging : ''} ${dragOverIndex === index ? styles.dragOver : ''}`}
        >
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
