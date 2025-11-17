import { useCallback, useRef, useState } from "react";
import type { Point } from "../utils/canvasUtils";
import type { CanvasComponent } from "../types/component";

interface UseSelectionBoxProps {
  isDrawing: boolean;
  isEraser: boolean;
  isThinkingPen: boolean;
  selectedComponentType: string | null;
  components: CanvasComponent[];
  onSelectionChange: (ids: string[]) => void;
}

export function useSelectionBox({
  isDrawing,
  isEraser,
  isThinkingPen,
  selectedComponentType,
  components,
  onSelectionChange,
}: UseSelectionBoxProps) {
  const [selectionBoxStart, setSelectionBoxStart] = useState<Point | null>(
    null,
  );
  const [selectionBoxEnd, setSelectionBoxEnd] = useState<Point | null>(null);
  const justFinishedSelectionBoxRef = useRef(false);

  const isCursorMode =
    !isDrawing && !isEraser && !isThinkingPen && !selectedComponentType;

  const startSelectionBox = useCallback(
    (point: Point) => {
      if (!isCursorMode) return;
      setSelectionBoxStart(point);
      setSelectionBoxEnd(point);
      onSelectionChange([]);
    },
    [isCursorMode, onSelectionChange],
  );

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
      setSelectionBoxEnd(point);
    },
    [isCursorMode, selectionBoxStart],
  );

  const finishSelectionBox = useCallback(() => {
    if (!selectionBoxStart || !selectionBoxEnd) return;

    const minX = Math.min(selectionBoxStart.x, selectionBoxEnd.x);
    const maxX = Math.max(selectionBoxStart.x, selectionBoxEnd.x);
    const minY = Math.min(selectionBoxStart.y, selectionBoxEnd.y);
    const maxY = Math.max(selectionBoxStart.y, selectionBoxEnd.y);

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
    }

    setSelectionBoxStart(null);
    setSelectionBoxEnd(null);
  }, [selectionBoxStart, selectionBoxEnd, components, onSelectionChange]);

  const clearSelectionBox = useCallback(() => {
    setSelectionBoxStart(null);
    setSelectionBoxEnd(null);
  }, []);

  const checkJustFinishedSelectionBox = useCallback(() => {
    return justFinishedSelectionBoxRef.current;
  }, []);

  return {
    selectionBoxStart,
    selectionBoxEnd,
    isCursorMode,
    startSelectionBox,
    updateSelectionBox,
    finishSelectionBox,
    clearSelectionBox,
    checkJustFinishedSelectionBox,
  };
}
