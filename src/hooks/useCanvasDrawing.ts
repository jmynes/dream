import { useCallback, useRef, useState } from "react";
import type { Point } from "../utils/canvasUtils";

interface UseCanvasDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  penColor: string;
  penSize: number;
  isDrawing: boolean;
  isEraser: boolean;
  isMagicWand: boolean;
  selectedComponentType: string | null;
  onCanvasStateChange?: (imageData: string | null) => void;
}

export function useCanvasDrawing({
  canvasRef,
  penColor,
  penSize,
  isDrawing,
  isEraser,
  isMagicWand,
  selectedComponentType,
  onCanvasStateChange,
}: UseCanvasDrawingProps) {
  // Use refs to avoid re-renders on every mouse move
  const isDraggingPenRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  // Keep state for external consumers if needed, but update refs for performance
  const [isDraggingPen, setIsDraggingPen] = useState(false);

  const drawLine = useCallback(
    (from: Point, to: Point) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (isEraser) {
        // Use destination-out composite for erasing
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = penColor;
      }

      // Use exact penSize for both drawing and erasing
      ctx.lineWidth = penSize;

      // Use square caps for very small sizes to avoid oversized appearance
      // Round caps add radius that makes small lines appear much larger
      if (penSize <= 2) {
        ctx.lineCap = "square";
        ctx.lineJoin = "miter";
      } else {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    },
    [penColor, penSize, isEraser, canvasRef],
  );

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onCanvasStateChange) return;

    const imageData = canvas.toDataURL();
    onCanvasStateChange(imageData);
  }, [onCanvasStateChange, canvasRef]);

  const handleCanvasMouseDown = useCallback(
    (point: Point) => {
      if ((!isDrawing && !isEraser && !isMagicWand) || selectedComponentType)
        return;

      // Update refs immediately (no re-render)
      lastPointRef.current = point;
      isDraggingPenRef.current = true;
      // Update state only for external consumers
      setIsDraggingPen(true);
    },
    [isDrawing, isEraser, isMagicWand, selectedComponentType],
  );

  const handleCanvasMouseMove = useCallback(
    (point: Point, onPathPoint?: (point: Point) => void) => {
      // Use refs to avoid re-renders
      const dragging = isDraggingPenRef.current;
      const lastPoint = lastPointRef.current;

      if (
        !dragging ||
        (!isDrawing && !isEraser && !isMagicWand) ||
        !lastPoint ||
        selectedComponentType
      )
        return;

      // Track path for magic wand
      if (isMagicWand && onPathPoint) {
        onPathPoint(point);
      }

      // Draw line for regular drawing or eraser
      if (isDrawing || isEraser) {
        drawLine(lastPoint, point);
      } else if (isMagicWand) {
        // Draw temporary line for magic wand
        drawLine(lastPoint, point);
      }

      // Update ref (no re-render)
      lastPointRef.current = point;
    },
    [
      isDrawing,
      isEraser,
      isMagicWand,
      selectedComponentType,
      drawLine,
    ],
  );

  const handleCanvasMouseUp = useCallback(() => {
    // Reset refs immediately (no re-render)
    isDraggingPenRef.current = false;
    lastPointRef.current = null;
    // Update state for external consumers
    setIsDraggingPen(false);

    // Save canvas state after drawing/erasing
    if (isDrawing || isEraser) {
      // Use setTimeout to ensure the drawing is complete
      setTimeout(() => {
        saveCanvasState();
      }, 0);
    }
  }, [isDrawing, isEraser, saveCanvasState]);

  return {
    isDraggingPen,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
  };
}
