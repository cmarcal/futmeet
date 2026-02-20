/**
 * Utility functions for drag and drop calculations
 */

export interface DragPosition {
  x: number;
  y: number;
}

export interface ItemBounds {
  top: number;
  bottom: number;
  height: number;
}

/**
 * Calculates which index a position should be inserted at
 */
export const calculateInsertIndex = (
  positionY: number,
  items: ItemBounds[],
  draggedIndex: number,
  sensitivity: number = 0.2
): number | null => {
  if (items.length === 0) return null;

  // Find which item the position is over (excluding the dragged item)
  for (let i = 0; i < items.length; i++) {
    if (i === draggedIndex) continue;

    const item = items[i];
    // Expand the detection area for better sensitivity
    const expandedTop = item.top - item.height * sensitivity;
    const expandedBottom = item.bottom + item.height * sensitivity;

    if (positionY >= expandedTop && positionY <= expandedBottom) {
      const middle = item.top + item.height / 2;
      // If position is in upper half, insert before this item
      // If position is in lower half, insert after this item
      const insertIndex = positionY < middle ? i : i + 1;
      // Adjust for the fact that we're removing the dragged item
      return insertIndex > draggedIndex ? insertIndex - 1 : insertIndex;
    }
  }

  // Check if position is above first item
  const firstItem = items[0];
  if (firstItem && positionY < firstItem.top - firstItem.height * sensitivity) {
    return 0;
  }

  // Check if position is below last item
  const lastItem = items[items.length - 1];
  if (lastItem && positionY > lastItem.bottom + lastItem.height * sensitivity) {
    return items.length - 1;
  }

  return null;
};

/**
 * Calculates the shift amount for items between dragged and target positions
 */
export const calculateItemShift = (
  index: number,
  draggedIndex: number,
  targetIndex: number
): number => {
  if (draggedIndex === null || targetIndex === null || index === draggedIndex) {
    return 0;
  }

  // Calculate shift based on drag direction
  if (draggedIndex < targetIndex) {
    // Dragging down: items between dragged and target shift up
    if (index > draggedIndex && index <= targetIndex) {
      return -1; // Shift up
    }
  } else if (draggedIndex > targetIndex) {
    // Dragging up: items between target and dragged shift down
    if (index >= targetIndex && index < draggedIndex) {
      return 1; // Shift down
    }
  }

  return 0;
};

/**
 * Gets item bounds from DOM elements
 */
export const getItemBounds = (elements: (HTMLElement | null)[]): ItemBounds[] => {
  return elements
    .filter((el): el is HTMLElement => el !== null)
    .map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height,
      };
    });
};

/**
 * Calculates item height including gap
 */
export const getItemHeightWithGap = (element: HTMLElement | null, gap: number = 8): number => {
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  return rect.height + gap;
};
