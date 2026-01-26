import { useState, useRef, useCallback } from 'react';
import { calculateInsertIndex, calculateItemShift, getItemBounds, getItemHeightWithGap } from '../utils/dragAndDropUtils';

export interface UseDragAndDropOptions {
  itemCount: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  enabled?: boolean;
}

export interface UseDragAndDropReturn {
  // State
  draggedIndex: number | null;
  dragOverIndex: number | null;
  touchStartIndex: number | null;
  touchStartY: number | null;
  touchCurrentY: number | null;

  // Desktop drag handlers
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, index: number) => void;

  // Touch drag handlers
  handleTouchStart: (e: React.TouchEvent, index: number) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleTouchCancel: () => void;

  // Utility functions
  getItemShift: (index: number) => number;
  getItemHeight: () => number;
  isDragging: (index: number) => boolean;
  isDragOver: (index: number) => boolean;

  // Refs
  listRef: React.RefObject<HTMLUListElement>;
  itemRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
}

export const useDragAndDrop = ({
  itemCount,
  onReorder,
  enabled = true,
}: UseDragAndDropOptions): UseDragAndDropReturn => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [touchStartIndex, setTouchStartIndex] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);

  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Desktop drag handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      if (!enabled) return;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', index.toString());
      setDraggedIndex(index);
    },
    [enabled]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      if (draggedIndex === null || draggedIndex === index || !enabled) return;

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
      if (targetIndex >= 0 && targetIndex < itemCount && targetIndex !== draggedIndex) {
        setDragOverIndex(targetIndex);
      } else if (targetIndex === draggedIndex && draggedIndex < itemCount - 1) {
        // If we're at the dragged position but moving down, go to next position
        setDragOverIndex(draggedIndex + 1);
      }
    },
    [draggedIndex, itemCount, enabled]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== dropIndex && onReorder && enabled) {
        onReorder(draggedIndex, dropIndex);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, onReorder, enabled]
  );

  // Touch drag handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent, index: number) => {
      if (!enabled || !onReorder) return;

      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        return;
      }

      const touch = e.touches[0];
      setTouchStartIndex(index);
      setTouchStartY(touch.clientY);
      setTouchCurrentY(touch.clientY);
      setDraggedIndex(index);
    },
    [enabled, onReorder]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartIndex === null || touchStartY === null || !enabled) return;

      e.preventDefault();
      const touch = e.touches[0];
      setTouchCurrentY(touch.clientY);

      const items = getItemBounds(itemRefs.current);
      const targetIndex = calculateInsertIndex(touch.clientY, items, touchStartIndex);

      if (targetIndex !== null && targetIndex !== touchStartIndex && targetIndex >= 0 && targetIndex < itemCount) {
        setDragOverIndex(targetIndex);
      } else {
        setDragOverIndex(null);
      }
    },
    [touchStartIndex, touchStartY, itemCount, enabled]
  );

  const handleTouchEnd = useCallback(() => {
    if (touchStartIndex === null || !enabled) return;

    if (dragOverIndex !== null && dragOverIndex !== touchStartIndex && onReorder) {
      onReorder(touchStartIndex, dragOverIndex);
    }

    setTouchStartIndex(null);
    setTouchStartY(null);
    setTouchCurrentY(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [touchStartIndex, dragOverIndex, onReorder, enabled]);

  const handleTouchCancel = useCallback(() => {
    setTouchStartIndex(null);
    setTouchStartY(null);
    setTouchCurrentY(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Utility functions
  const getItemShift = useCallback(
    (index: number): number => {
      return calculateItemShift(index, draggedIndex ?? -1, dragOverIndex ?? -1);
    },
    [draggedIndex, dragOverIndex]
  );

  const getItemHeight = useCallback((): number => {
    const firstItem = itemRefs.current.find((el): el is HTMLLIElement => el !== null);
    return getItemHeightWithGap(firstItem ?? null);
  }, []);

  const isDragging = useCallback(
    (index: number): boolean => {
      return draggedIndex === index;
    },
    [draggedIndex]
  );

  const isDragOver = useCallback(
    (index: number): boolean => {
      return dragOverIndex === index;
    },
    [dragOverIndex]
  );

  return {
    // State
    draggedIndex,
    dragOverIndex,
    touchStartIndex,
    touchStartY,
    touchCurrentY,

    // Desktop drag handlers
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,

    // Touch drag handlers
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,

    // Utility functions
    getItemShift,
    getItemHeight,
    isDragging,
    isDragOver,

    // Refs
    listRef,
    itemRefs,
  };
};
