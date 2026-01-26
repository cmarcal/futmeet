import { useState, useRef } from 'react';
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
  const [touchStartIndex, setTouchStartIndex] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === index) return;

    // Use the mouse position to determine if we should insert before or after
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseY = e.clientY;
    const middle = rect.top + rect.height / 2;
    
    // If mouse is in upper half, insert before this item
    // If mouse is in lower half, insert after this item
    let targetIndex = mouseY < middle ? index : index + 1;
    
    // Adjust for the fact that we're removing the dragged item
    if (draggedIndex < targetIndex) {
      targetIndex = targetIndex - 1;
    }
    
    // Ensure valid index and different from dragged
    if (targetIndex >= 0 && targetIndex < players.length && targetIndex !== draggedIndex) {
      setDragOverIndex(targetIndex);
    } else if (targetIndex === draggedIndex && draggedIndex < players.length - 1) {
      // If we're at the dragged position but moving down, go to next position
      setDragOverIndex(draggedIndex + 1);
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

  const getTouchTargetIndex = (touchY: number): number | null => {
    if (!listRef.current || touchStartIndex === null) return null;

    const items = itemRefs.current.filter(Boolean) as HTMLLIElement[];
    if (items.length === 0) return null;

    // Find which item the touch is over (excluding the dragged item)
    for (let i = 0; i < items.length; i++) {
      if (i === touchStartIndex) continue;
      
      const item = items[i];
      const rect = item.getBoundingClientRect();
      // Expand the detection area slightly for better sensitivity
      const expandedTop = rect.top - rect.height * 0.2;
      const expandedBottom = rect.bottom + rect.height * 0.2;
      
      if (touchY >= expandedTop && touchY <= expandedBottom) {
        const middle = rect.top + rect.height / 2;
        // If touch is in upper half, insert before this item
        // If touch is in lower half, insert after this item
        const insertIndex = touchY < middle ? i : i + 1;
        // Adjust for the fact that we're removing the dragged item
        const adjustedIndex = insertIndex > touchStartIndex ? insertIndex - 1 : insertIndex;
        
        // Ensure valid index
        if (adjustedIndex >= 0 && adjustedIndex < players.length && adjustedIndex !== touchStartIndex) {
          return adjustedIndex;
        }
      }
    }

    // Check if touch is above first item (with expanded area)
    const firstItem = items[0];
    if (firstItem) {
      const firstRect = firstItem.getBoundingClientRect();
      if (touchY < firstRect.top - firstRect.height * 0.2) {
        return 0;
      }
    }

    // Check if touch is below last item (with expanded area)
    const lastItem = items[items.length - 1];
    if (lastItem) {
      const lastRect = lastItem.getBoundingClientRect();
      if (touchY > lastRect.bottom + lastRect.height * 0.2) {
        return items.length - 1; // Last position after removing dragged item
      }
    }

    return null;
  };

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (!showActions || !onReorder) return;

    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }

    const touch = e.touches[0];
    setTouchStartIndex(index);
    setTouchStartY(touch.clientY);
    setTouchCurrentY(touch.clientY);
    setDraggedIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartIndex === null || touchStartY === null) return;

    e.preventDefault();
    const touch = e.touches[0];
    setTouchCurrentY(touch.clientY);

    const targetIndex = getTouchTargetIndex(touch.clientY);
    if (targetIndex !== null && targetIndex !== touchStartIndex && targetIndex >= 0 && targetIndex < players.length) {
      setDragOverIndex(targetIndex);
    } else {
      setDragOverIndex(null);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartIndex === null) return;

    if (dragOverIndex !== null && dragOverIndex !== touchStartIndex && onReorder) {
      onReorder(touchStartIndex, dragOverIndex);
    }

    setTouchStartIndex(null);
    setTouchStartY(null);
    setTouchCurrentY(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleTouchCancel = () => {
    setTouchStartIndex(null);
    setTouchStartY(null);
    setTouchCurrentY(null);
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

  const getItemShift = (index: number): number => {
    if (draggedIndex === null || dragOverIndex === null) return 0;
    if (index === draggedIndex) return 0; // Don't shift the dragged item

    // Calculate shift based on drag direction
    if (draggedIndex < dragOverIndex) {
      // Dragging down: items between dragged and target shift up
      if (index > draggedIndex && index <= dragOverIndex) {
        return -1; // Shift up
      }
    } else if (draggedIndex > dragOverIndex) {
      // Dragging up: items between target and dragged shift down
      if (index >= dragOverIndex && index < draggedIndex) {
        return 1; // Shift down
      }
    }
    return 0;
  };

  const getItemHeight = (): number => {
    if (itemRefs.current.length === 0) return 0;
    const firstItem = itemRefs.current.find(Boolean);
    if (!firstItem) return 0;
    const rect = firstItem.getBoundingClientRect();
    const gap = 8; // Default gap spacing
    return rect.height + gap;
  };

  return (
    <ul
      ref={listRef}
      className={styles.list}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {players.map((player, index) => {
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;
        const shift = getItemShift(index);
        const itemHeight = getItemHeight();
        const shiftAmount = shift * itemHeight;

        return (
          <li
            key={player.id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className={`${styles.listItem} ${isDragging ? styles.dragging : ''} ${isDragOver ? styles.dragOver : ''} ${shift !== 0 ? styles.shifting : ''}`}
            style={{
              transform:
                touchStartIndex === index && touchCurrentY !== null && touchStartY !== null
                  ? `translateY(${touchCurrentY - touchStartY}px)`
                  : shift !== 0
                    ? `translateY(${shiftAmount}px)`
                    : undefined,
              zIndex: isDragging ? 1000 : shift !== 0 ? 1 : undefined,
              transition: touchStartIndex === index ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {isDragOver && !isDragging && draggedIndex !== null && (
              <div
                className={styles.dropPlaceholder}
                aria-hidden="true"
                style={{
                  top: draggedIndex < dragOverIndex ? '100%' : '0',
                  transform: draggedIndex < dragOverIndex ? 'translateY(-2px)' : 'translateY(-2px)',
                }}
              />
            )}
            <PlayerCard
              player={player}
              index={index}
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
              isDragging={isDragging}
            />
          </li>
        );
      })}
    </ul>
  );
};
