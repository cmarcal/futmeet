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

export interface UseDragAndDropReturn {
  draggedIndex: number | null;
  dragOverIndex: number | null;
  touchStartIndex: number | null;
  touchStartY: number | null;
  touchCurrentY: number | null;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  handleTouchStart: (e: React.TouchEvent, index: number) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleTouchCancel: () => void;
  getItemShift: (index: number) => number;
  getItemHeight: () => number;
  isDragging: (index: number) => boolean;
  isDragOver: (index: number) => boolean;
  listRef: React.RefObject<HTMLUListElement>;
  itemRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
}

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
      return { ...state, draggedIndex: action.payload.index };

    case 'DRAG_END':
      return { ...state, draggedIndex: null, dragOverIndex: null };

    case 'DRAG_OVER':
      return { ...state, dragOverIndex: action.payload.index };

    case 'DRAG_LEAVE':
      return { ...state, dragOverIndex: null };

    case 'TOUCH_START':
      return {
        ...state,
        touchStartIndex: action.payload.index,
        touchStartY: action.payload.y,
        touchCurrentY: action.payload.y,
        draggedIndex: action.payload.index,
      };

    case 'TOUCH_MOVE':
      return { ...state, touchCurrentY: action.payload.y };

    case 'TOUCH_END':
    case 'TOUCH_CANCEL':
    case 'RESET':
      return initialState;

    default:
      return state;
  }
};

const calculateDesktopTargetIndex = (
  mouseY: number,
  elementRect: DOMRect,
  currentIndex: number,
  draggedIndex: number,
  itemCount: number
): number | null => {
  const middle = elementRect.top + elementRect.height / 2;
  let targetIndex = mouseY < middle ? currentIndex : currentIndex + 1;

  if (draggedIndex < targetIndex) {
    targetIndex = targetIndex - 1;
  }

  if (targetIndex >= 0 && targetIndex < itemCount && targetIndex !== draggedIndex) {
    return targetIndex;
  }

  if (targetIndex === draggedIndex && draggedIndex < itemCount - 1) {
    return draggedIndex + 1;
  }

  return null;
};

const isButtonElement = (target: HTMLElement): boolean => {
  return target.tagName === 'BUTTON' || target.closest('button') !== null;
};

export const useDragAndDrop = ({
  itemCount,
  onReorder,
  enabled = true,
}: UseDragAndDropOptions): UseDragAndDropReturn => {
  const [state, dispatch] = useReducer(dragReducer, initialState);
  const { draggedIndex, dragOverIndex, touchStartIndex, touchStartY, touchCurrentY } = state;

  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

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

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const targetIndex = calculateDesktopTargetIndex(e.clientY, rect, index, draggedIndex, itemCount);

      if (targetIndex !== null) {
        dispatch({ type: 'DRAG_OVER', payload: { index: targetIndex } });
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

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, index: number) => {
      if (!enabled || !onReorder) return;
      if (isButtonElement(e.target as HTMLElement)) return;

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
    (index: number): boolean => draggedIndex === index,
    [draggedIndex]
  );

  const isDragOver = useCallback(
    (index: number): boolean => dragOverIndex === index,
    [dragOverIndex]
  );

  return {
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
  };
};
