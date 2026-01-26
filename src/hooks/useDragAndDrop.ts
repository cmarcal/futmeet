import { useReducer, useRef, useCallback } from 'react';
import { calculateInsertIndex, calculateItemShift, getItemBounds, getItemHeightWithGap } from '../utils/dragAndDropUtils';

export interface UseDragAndDropOptions {
  itemCount: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  enabled?: boolean;
}

interface DragState {
  draggedIndex: number | null;
  dragOverIndex: number | null;
  touchStartIndex: number | null;
  touchStartY: number | null;
  touchCurrentY: number | null;
}

type DragAction =
  | { type: 'DRAG_START'; payload: { index: number } }
  | { type: 'DRAG_END' }
  | { type: 'DRAG_OVER'; payload: { index: number } }
  | { type: 'DRAG_LEAVE' }
  | { type: 'TOUCH_START'; payload: { index: number; y: number } }
  | { type: 'TOUCH_MOVE'; payload: { y: number } }
  | { type: 'TOUCH_END' }
  | { type: 'TOUCH_CANCEL' }
  | { type: 'RESET' };

const initialState: DragState = {
  draggedIndex: null,
  dragOverIndex: null,
  touchStartIndex: null,
  touchStartY: null,
  touchCurrentY: null,
};

const dragReducer = (state: DragState, action: DragAction): DragState => {
  switch (action.type) {
    case 'DRAG_START':
      return {
        ...state,
        draggedIndex: action.payload.index,
      };

    case 'DRAG_END':
      return {
        ...state,
        draggedIndex: null,
        dragOverIndex: null,
      };

    case 'DRAG_OVER':
      return {
        ...state,
        dragOverIndex: action.payload.index,
      };

    case 'DRAG_LEAVE':
      return {
        ...state,
        dragOverIndex: null,
      };

    case 'TOUCH_START':
      return {
        ...state,
        touchStartIndex: action.payload.index,
        touchStartY: action.payload.y,
        touchCurrentY: action.payload.y,
        draggedIndex: action.payload.index,
      };

    case 'TOUCH_MOVE':
      return {
        ...state,
        touchCurrentY: action.payload.y,
      };

    case 'TOUCH_END':
    case 'TOUCH_CANCEL':
    case 'RESET':
      return initialState;

    default:
      return state;
  }
};

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
  const [state, dispatch] = useReducer(dragReducer, initialState);
  const { draggedIndex, dragOverIndex, touchStartIndex, touchStartY, touchCurrentY } = state;

  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Desktop drag handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      if (!enabled) return;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', index.toString());
      dispatch({ type: 'DRAG_START', payload: { index } });
    },
    [enabled]
  );

  const handleDragEnd = useCallback(() => {
    dispatch({ type: 'DRAG_END' });
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
        dispatch({ type: 'DRAG_OVER', payload: { index: targetIndex } });
      } else if (targetIndex === draggedIndex && draggedIndex < itemCount - 1) {
        // If we're at the dragged position but moving down, go to next position
        dispatch({ type: 'DRAG_OVER', payload: { index: draggedIndex + 1 } });
      }
    },
    [draggedIndex, itemCount, enabled]
  );

  const handleDragLeave = useCallback(() => {
    dispatch({ type: 'DRAG_LEAVE' });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== dropIndex && onReorder && enabled) {
        onReorder(draggedIndex, dropIndex);
      }
      dispatch({ type: 'DRAG_END' });
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
      dispatch({ type: 'TOUCH_START', payload: { index, y: touch.clientY } });
    },
    [enabled, onReorder]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartIndex === null || touchStartY === null || !enabled) return;

      e.preventDefault();
      const touch = e.touches[0];
      dispatch({ type: 'TOUCH_MOVE', payload: { y: touch.clientY } });

      const items = getItemBounds(itemRefs.current);
      const targetIndex = calculateInsertIndex(touch.clientY, items, touchStartIndex);

      if (targetIndex !== null && targetIndex !== touchStartIndex && targetIndex >= 0 && targetIndex < itemCount) {
        dispatch({ type: 'DRAG_OVER', payload: { index: targetIndex } });
      } else {
        dispatch({ type: 'DRAG_LEAVE' });
      }
    },
    [touchStartIndex, touchStartY, itemCount, enabled]
  );

  const handleTouchEnd = useCallback(() => {
    if (touchStartIndex === null || !enabled) return;

    if (dragOverIndex !== null && dragOverIndex !== touchStartIndex && onReorder) {
      onReorder(touchStartIndex, dragOverIndex);
    }

    dispatch({ type: 'TOUCH_END' });
  }, [touchStartIndex, dragOverIndex, onReorder, enabled]);

  const handleTouchCancel = useCallback(() => {
    dispatch({ type: 'TOUCH_CANCEL' });
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
