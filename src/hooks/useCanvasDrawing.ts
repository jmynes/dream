import { useCallback, useState } from "react";
import type { Point } from "../utils/canvasUtils";

interface UseCanvasDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  penColor: string;
  penSize: number;
  isDrawing: boolean;
  isEraser: boolean;
  isThinkingPen: boolean;
  selectedComponentType: string | null;
  onCanvasStateChange?: (imageData: string | null) => void;
}

export function useCanvasDrawing({
  canvasRef,
  penColor,
  penSize,
  isDrawing,
  isEraser,
  isThinkingPen,
  selectedComponentType,
  onCanvasStateChange,
}: UseCanvasDrawingProps) {
  const [isDraggingPen, setIsDraggingPen] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

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

      ctx.lineWidth = penSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

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
      if ((!isDrawing && !isEraser && !isThinkingPen) || selectedComponentType)
        return;

      setLastPoint(point);
      setIsDraggingPen(true);
    },
    [isDrawing, isEraser, isThinkingPen, selectedComponentType],
  );

  const handleCanvasMouseMove = useCallback(
    (point: Point, onPathPoint?: (point: Point) => void) => {
      if (
        !isDraggingPen ||
        (!isDrawing && !isEraser && !isThinkingPen) ||
        !lastPoint ||
        selectedComponentType
      )
        return;

      // Track path for thinking pen
      if (isThinkingPen && onPathPoint) {
        onPathPoint(point);
      }

      // Draw line for regular drawing or eraser
      if (isDrawing || isEraser) {
        drawLine(lastPoint, point);
      } else if (isThinkingPen) {
        // Draw temporary line for thinking pen
        drawLine(lastPoint, point);
      }

      setLastPoint(point);
    },
    [
      isDraggingPen,
      isDrawing,
      isEraser,
      isThinkingPen,
      lastPoint,
      selectedComponentType,
      drawLine,
    ],
  );

  const handleCanvasMouseUp = useCallback(() => {
    // Just reset drag state - allow multiple strokes before submit
    setIsDraggingPen(false);
    setLastPoint(null);

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
