import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from './useDragAndDrop';

const createMockDragEvent = (clientY: number, currentTarget?: HTMLElement): React.DragEvent => {
  const dataTransfer = {
    effectAllowed: '',
    setData: vi.fn(),
    getData: vi.fn(),
  };
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer,
    clientY,
    currentTarget: currentTarget ?? document.createElement('li'),
  } as unknown as React.DragEvent;
};

const createMockTouchEvent = (clientY: number, target: HTMLElement = document.createElement('div')): React.TouchEvent => ({
  touches: [{ clientY, clientX: 0 } as Touch],
  target,
  preventDefault: vi.fn(),
} as unknown as React.TouchEvent);

describe('useDragAndDrop', () => {
  const defaultOptions = {
    itemCount: 3,
    onReorder: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return null for drag-related state when no drag is active', () => {
      const { result } = renderHook(() => useDragAndDrop(defaultOptions));

      expect(result.current.draggedIndex).toBeNull();
      expect(result.current.dragOverIndex).toBeNull();
      expect(result.current.touchStartIndex).toBeNull();
      expect(result.current.touchStartY).toBeNull();
      expect(result.current.touchCurrentY).toBeNull();
    });

    it('should return all handlers and refs', () => {
      const { result } = renderHook(() => useDragAndDrop(defaultOptions));

      expect(result.current.handleDragStart).toBeDefined();
      expect(result.current.handleDragEnd).toBeDefined();
      expect(result.current.handleDragOver).toBeDefined();
      expect(result.current.handleDragLeave).toBeDefined();
      expect(result.current.handleDrop).toBeDefined();
      expect(result.current.handleTouchStart).toBeDefined();
      expect(result.current.handleTouchMove).toBeDefined();
      expect(result.current.handleTouchEnd).toBeDefined();
      expect(result.current.handleTouchCancel).toBeDefined();
      expect(result.current.getItemShift).toBeDefined();
      expect(result.current.getItemHeight).toBeDefined();
      expect(result.current.isDragging).toBeDefined();
      expect(result.current.isDragOver).toBeDefined();
      expect(result.current.listRef).toEqual({ current: null });
      expect(result.current.itemRefs).toBeDefined();
    });
  });

  describe('desktop drag and drop', () => {
    it('should set draggedIndex on handleDragStart', () => {
      const { result } = renderHook(() => useDragAndDrop(defaultOptions));
      const e = createMockDragEvent(100);

      act(() => {
        result.current.handleDragStart(e, 1);
      });

      expect(result.current.draggedIndex).toBe(1);
      expect(e.dataTransfer.effectAllowed).toBe('move');
      expect(e.dataTransfer.setData).toHaveBeenCalledWith('text/html', '1');
    });

    it('should not set draggedIndex when enabled is false', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({ ...defaultOptions, enabled: false })
      );
      const e = createMockDragEvent(100);

      act(() => {
        result.current.handleDragStart(e, 1);
      });

      expect(result.current.draggedIndex).toBeNull();
    });

    it('should clear draggedIndex and dragOverIndex on handleDragEnd', () => {
      const { result } = renderHook(() => useDragAndDrop(defaultOptions));
      const e = createMockDragEvent(100);

      act(() => {
        result.current.handleDragStart(e, 1);
      });
      expect(result.current.draggedIndex).toBe(1);

      act(() => {
        result.current.handleDragEnd();
      });

      expect(result.current.draggedIndex).toBeNull();
      expect(result.current.dragOverIndex).toBeNull();
    });

    it('should clear dragOverIndex on handleDragLeave', () => {
      const { result } = renderHook(() => useDragAndDrop(defaultOptions));
      const startE = createMockDragEvent(100);
      const el = document.createElement('li');
      el.getBoundingClientRect = () => ({ top: 0, height: 40, bottom: 40 } as DOMRect);
      const overE = createMockDragEvent(50, el);

      act(() => {
        result.current.handleDragStart(startE, 0);
      });
      act(() => {
        result.current.handleDragOver(overE, 1);
      });
      expect(result.current.dragOverIndex).not.toBeNull();

      act(() => {
        result.current.handleDragLeave();
      });

      expect(result.current.dragOverIndex).toBeNull();
    });

    it('should call onReorder with fromIndex and toIndex on handleDrop when indices differ', () => {
      const onReorder = vi.fn();
      const { result } = renderHook(() =>
        useDragAndDrop({ ...defaultOptions, onReorder })
      );
      const startE = createMockDragEvent(100);

      act(() => {
        result.current.handleDragStart(startE, 0);
      });

      const dropE = createMockDragEvent(100);
      act(() => {
        result.current.handleDrop(dropE, 2);
      });

      expect(onReorder).toHaveBeenCalledTimes(1);
      expect(onReorder).toHaveBeenCalledWith(0, 2);
      expect(result.current.draggedIndex).toBeNull();
    });

    it('should not call onReorder when drop index equals dragged index', () => {
      const onReorder = vi.fn();
      const { result } = renderHook(() =>
        useDragAndDrop({ ...defaultOptions, onReorder })
      );
      const startE = createMockDragEvent(100);

      act(() => {
        result.current.handleDragStart(startE, 1);
      });

      const dropE = createMockDragEvent(100);
      act(() => {
        result.current.handleDrop(dropE, 1);
      });

      expect(onReorder).not.toHaveBeenCalled();
    });

    it('should not call onReorder when enabled is false', () => {
      const onReorder = vi.fn();
      const { result } = renderHook(() =>
        useDragAndDrop({ ...defaultOptions, onReorder, enabled: false })
      );
      const startE = createMockDragEvent(100);

      act(() => {
        result.current.handleDragStart(startE, 0);
      });

      const dropE = createMockDragEvent(100);
      act(() => {
        result.current.handleDrop(dropE, 2);
      });

      expect(onReorder).not.toHaveBeenCalled();
    });
  });

  describe('isDragging and isDragOver', () => {
    it('should return true for isDragging only at dragged index', () => {
      const { result } = renderHook(() => useDragAndDrop(defaultOptions));
      const e = createMockDragEvent(100);

      act(() => {
        result.current.handleDragStart(e, 1);
      });

      expect(result.current.isDragging(0)).toBe(false);
      expect(result.current.isDragging(1)).toBe(true);
      expect(result.current.isDragging(2)).toBe(false);
    });

    it('should return true for isDragOver only at dragOver index', () => {
      const { result } = renderHook(() => useDragAndDrop(defaultOptions));
      const startE = createMockDragEvent(100);
      const el = document.createElement('li');
      el.getBoundingClientRect = () => ({ top: 0, height: 40, bottom: 40 } as DOMRect);
      const overE = createMockDragEvent(20, el);

      act(() => {
        result.current.handleDragStart(startE, 0);
      });
      act(() => {
        result.current.handleDragOver(overE, 1);
      });

      const dragOverIdx = result.current.dragOverIndex;
      expect(typeof dragOverIdx).toBe('number');
      if (dragOverIdx !== null) {
        expect(result.current.isDragOver(dragOverIdx)).toBe(true);
      }
    });
  });

  describe('getItemShift', () => {
    it('should return 0 when no drag is active', () => {
      const { result } = renderHook(() => useDragAndDrop(defaultOptions));

      expect(result.current.getItemShift(0)).toBe(0);
      expect(result.current.getItemShift(1)).toBe(0);
    });
  });

  describe('getItemHeight', () => {
    it('should return 0 when no item refs are set', () => {
      const { result } = renderHook(() => useDragAndDrop(defaultOptions));

      expect(result.current.getItemHeight()).toBe(0);
    });
  });

  describe('touch handlers', () => {
    it('should set touch state on handleTouchStart', () => {
      const { result } = renderHook(() => useDragAndDrop(defaultOptions));
      const e = createMockTouchEvent(100);

      act(() => {
        result.current.handleTouchStart(e, 1);
      });

      expect(result.current.touchStartIndex).toBe(1);
      expect(result.current.touchStartY).toBe(100);
      expect(result.current.touchCurrentY).toBe(100);
      expect(result.current.draggedIndex).toBe(1);
    });

    it('should not set touch state when enabled is false', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({ ...defaultOptions, enabled: false })
      );
      const e = createMockTouchEvent(100);

      act(() => {
        result.current.handleTouchStart(e, 1);
      });

      expect(result.current.touchStartIndex).toBeNull();
      expect(result.current.draggedIndex).toBeNull();
    });

    it('should reset state on handleTouchCancel', () => {
      const { result } = renderHook(() => useDragAndDrop(defaultOptions));
      const e = createMockTouchEvent(100);

      act(() => {
        result.current.handleTouchStart(e, 1);
      });
      expect(result.current.touchStartIndex).toBe(1);

      act(() => {
        result.current.handleTouchCancel();
      });

      expect(result.current.touchStartIndex).toBeNull();
      expect(result.current.touchStartY).toBeNull();
      expect(result.current.touchCurrentY).toBeNull();
      expect(result.current.draggedIndex).toBeNull();
    });

    it('should call onReorder on handleTouchEnd when dragOverIndex differs from touchStartIndex', () => {
      const onReorder = vi.fn();
      const { result } = renderHook(() =>
        useDragAndDrop({ ...defaultOptions, onReorder })
      );
      const startE = createMockTouchEvent(100);

      act(() => {
        result.current.handleTouchStart(startE, 0);
      });

      // Set dragOverIndex to 2 via handleDragOver (clientY 50, rect top=0 height=40 -> targetIndex 2)
      const overEl = document.createElement('li');
      overEl.getBoundingClientRect = () => ({ top: 0, height: 40, bottom: 40 } as DOMRect);
      const overE = createMockDragEvent(50, overEl);
      act(() => {
        result.current.handleDragOver(overE, 2);
      });
      expect(result.current.dragOverIndex).toBe(2);

      act(() => {
        result.current.handleTouchEnd();
      });

      expect(onReorder).toHaveBeenCalledWith(0, 2);
      expect(result.current.touchStartIndex).toBeNull();
    });

    it('should not set touch state when target is a button', () => {
      const { result } = renderHook(() => useDragAndDrop(defaultOptions));
      const button = document.createElement('button');
      const e = createMockTouchEvent(100, button);

      act(() => {
        result.current.handleTouchStart(e, 1);
      });

      expect(result.current.touchStartIndex).toBeNull();
      expect(result.current.draggedIndex).toBeNull();
    });
  });
});
