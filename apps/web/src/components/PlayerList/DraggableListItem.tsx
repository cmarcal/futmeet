import { PlayerCard } from '../PlayerCard';
import type { Player } from '../../types';
import styles from './PlayerList.module.css';

export interface DraggableListItemProps {
  player: Player;
  index: number;
  isDragging: boolean;
  isDragOver: boolean;
  isShifting: boolean;
  shiftAmount: number;
  touchOffset: number | null;
  draggedIndex: number | null;
  dragOverIndex: number | null;
  onTogglePriority?: (playerId: string) => void;
  onRemove?: (playerId: string) => void;
  showActions: boolean;
  draggable: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onItemRef: (el: HTMLLIElement | null) => void;
}

export const DraggableListItem = ({
  player,
  index,
  isDragging,
  isDragOver,
  isShifting,
  shiftAmount,
  touchOffset,
  draggedIndex,
  dragOverIndex,
  onTogglePriority,
  onRemove,
  showActions,
  draggable,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onTouchStart,
  onItemRef,
}: DraggableListItemProps) => {
  const transform =
    touchOffset !== null
      ? `translateY(${touchOffset}px)`
      : isShifting
        ? `translateY(${shiftAmount}px)`
        : undefined;

  return (
    <li
      ref={onItemRef}
      className={`${styles.listItem} ${isDragging ? styles.dragging : ''} ${isDragOver ? styles.dragOver : ''} ${isShifting ? styles.shifting : ''}`}
      style={{
        transform,
        zIndex: isDragging ? 1000 : isShifting ? 1 : undefined,
        transition: touchOffset !== null ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {isDragOver && !isDragging && draggedIndex !== null && (
        <div
          className={styles.dropPlaceholder}
          aria-hidden="true"
          style={{
            top: draggedIndex !== null && dragOverIndex !== null && draggedIndex < dragOverIndex ? '100%' : '0',
            transform: 'translateY(-2px)',
          }}
        />
      )}
      <PlayerCard
        player={player}
        index={index}
        onTogglePriority={onTogglePriority}
        onRemove={onRemove}
        showActions={showActions}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onTouchStart={onTouchStart}
        isDragging={isDragging}
      />
    </li>
  );
};
