import { useCallback, useRef, useState } from "react";
import type { Point } from "../utils/canvasUtils";
import type { CanvasComponent } from "../types/component";

interface UseSelectionBoxProps {
  isDrawing: boolean;
  isEraser: boolean;
  isMagicWand: boolean;
  isLasso: boolean;
  selectedComponentType: string | null;
  components: CanvasComponent[];
  onSelectionChange: (ids: string[]) => void;
}

export function useSelectionBox({
  isDrawing,
  isEraser,
  isMagicWand,
  isLasso,
  selectedComponentType,
  components,
  onSelectionChange,
}: UseSelectionBoxProps) {
  const [selectionBoxStart, setSelectionBoxStart] = useState<Point | null>(
    null,
  );
  const [selectionBoxEnd, setSelectionBoxEnd] = useState<Point | null>(null);
  const selectionBoxEndRef = useRef<Point | null>(null);
  const justFinishedSelectionBoxRef = useRef(false);

  const isCursorMode =
    !isDrawing &&
    !isEraser &&
    !isMagicWand &&
    !isLasso &&
    !selectedComponentType;

  const startSelectionBox = useCallback(
    (point: Point) => {
      if (!isCursorMode) return;
      setSelectionBoxStart(point);
      selectionBoxEndRef.current = point;
      setSelectionBoxEnd(point);
      onSelectionChange([]);
    },
    [isCursorMode, onSelectionChange],
  );

  const getPreviewSelection = useCallback((): string[] => {
    if (!selectionBoxStart || !selectionBoxEndRef.current) return [];
    
    const endPoint = selectionBoxEndRef.current;
    const minX = Math.min(selectionBoxStart.x, endPoint.x);
    const maxX = Math.max(selectionBoxStart.x, endPoint.x);
    const minY = Math.min(selectionBoxStart.y, endPoint.y);
    const maxY = Math.max(selectionBoxStart.y, endPoint.y);

    // Only return preview if the selection box has some size
    const hasSelectionBoxSize =
      Math.abs(maxX - minX) > 5 || Math.abs(maxY - minY) > 5;

    if (!hasSelectionBoxSize) return [];

    // Find components that intersect with the selection box
    const selectedComponents = components.filter((comp) => {
      const compRight = comp.x + (comp.width || 100);
      const compBottom = comp.y + (comp.height || 40);
      // Check for intersection: component overlaps with selection box
      return (
        comp.x < maxX &&
        compRight > minX &&
        comp.y < maxY &&
        compBottom > minY
      );
    });

    return selectedComponents.map((c) => c.id);
  }, [selectionBoxStart, components]);

  const updateSelectionBox = useCallback(
    (
      point: Point,
      draggedComponentId: string | null,
      resizingComponentId: string | null,
    ) => {
      if (
        !isCursorMode ||
        !selectionBoxStart ||
        draggedComponentId ||
        resizingComponentId
      ) {
        return;
      }
      // Update ref immediately - no state update, no re-render!
      // The SelectionBox component reads from this ref via requestAnimationFrame
      selectionBoxEndRef.current = point;
    },
    [isCursorMode, selectionBoxStart],
  );

  const finishSelectionBox = useCallback(() => {
    // Use ref value for final calculation (most up-to-date)
    const endPoint = selectionBoxEndRef.current;
    if (!selectionBoxStart || !endPoint) return;
    
    // Sync state with ref value for final render
    setSelectionBoxEnd(endPoint);

    const minX = Math.min(selectionBoxStart.x, endPoint.x);
    const maxX = Math.max(selectionBoxStart.x, endPoint.x);
    const minY = Math.min(selectionBoxStart.y, endPoint.y);
    const maxY = Math.max(selectionBoxStart.y, endPoint.y);

    // Only select if the selection box has some size (not just a click)
    const hasSelectionBoxSize =
      Math.abs(maxX - minX) > 5 || Math.abs(maxY - minY) > 5;

    if (hasSelectionBoxSize) {
      // Mark that we just finished a selection box drag
      justFinishedSelectionBoxRef.current = true;

      // Find components that intersect with the selection box
      const selectedComponents = components.filter((comp) => {
        const compRight = comp.x + (comp.width || 100);
        const compBottom = comp.y + (comp.height || 40);
        // Check for intersection: component overlaps with selection box
        return (
          comp.x < maxX &&
          compRight > minX &&
          comp.y < maxY &&
          compBottom > minY
        );
      });

      // Select all components that intersect with the box
      // Note: Selection is already updated in real-time during drag,
      // so this just ensures final state is correct
      if (selectedComponents.length > 0) {
        onSelectionChange(selectedComponents.map((c) => c.id));
      } else {
        // If no components were found in the box, deselect all
        onSelectionChange([]);
      }

      // Reset the flag after a short delay to allow click handler to check it
      setTimeout(() => {
        justFinishedSelectionBoxRef.current = false;
      }, 0);
    } else {
      // If it was just a click (no size), deselect all
      onSelectionChange([]);
    }

    setSelectionBoxStart(null);
    selectionBoxEndRef.current = null;
    setSelectionBoxEnd(null);
  }, [selectionBoxStart, components, onSelectionChange]);

  const clearSelectionBox = useCallback(() => {
    setSelectionBoxStart(null);
    selectionBoxEndRef.current = null;
    setSelectionBoxEnd(null);
  }, []);

  const checkJustFinishedSelectionBox = useCallback(() => {
    return justFinishedSelectionBoxRef.current;
  }, []);

  return {
    selectionBoxStart,
    selectionBoxEnd,
    selectionBoxEndRef, // Expose ref for direct DOM updates (no re-renders)
    isCursorMode,
    startSelectionBox,
    updateSelectionBox,
    finishSelectionBox,
    clearSelectionBox,
    checkJustFinishedSelectionBox,
    getPreviewSelection,
  };
}
