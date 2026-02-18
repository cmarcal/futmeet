import { memo } from 'react';
import { Users } from 'lucide-react';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { DraggableListItem } from './DraggableListItem';
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

export const PlayerList = memo(({
  players,
  onTogglePriority,
  onRemove,
  onReorder,
  showActions = true,
  emptyMessage = 'No players yet',
  emptySubMessage = 'Add your first player to get started',
}: PlayerListProps) => {
  const dragAndDrop = useDragAndDrop({
    itemCount: players.length,
    onReorder: onReorder || (() => {}),
    enabled: showActions && !!onReorder,
  });

  const {
    draggedIndex,
    dragOverIndex,
    touchStartIndex,
    touchStartY,
    touchCurrentY,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    getItemShift,
    getItemHeight,
    isDragging,
    isDragOver,
    listRef,
    itemRefs,
  } = dragAndDrop;

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
    <ul
      ref={listRef}
      className={styles.list}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {players.map((player, index) => {
        const shift = getItemShift(index);
        const itemHeight = getItemHeight();
        const shiftAmount = shift * itemHeight;
        const touchOffset =
          touchStartIndex === index && touchCurrentY !== null && touchStartY !== null
            ? touchCurrentY - touchStartY
            : null;

        return (
          <DraggableListItem
            key={player.id}
            player={player}
            index={index}
            isDragging={isDragging(index)}
            isDragOver={isDragOver(index)}
            isShifting={shift !== 0}
            shiftAmount={shiftAmount}
            touchOffset={touchOffset}
            draggedIndex={draggedIndex}
            dragOverIndex={dragOverIndex}
            onTogglePriority={onTogglePriority}
            onRemove={onRemove}
            showActions={showActions}
            draggable={showActions && !!onReorder}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onTouchStart={(e) => handleTouchStart(e, index)}
            onItemRef={(el) => {
              itemRefs.current[index] = el;
            }}
          />
        );
      })}
    </ul>
  );
});
