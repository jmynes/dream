import { useCallback, useRef, useState } from "react";
import type { Point } from "../../utils/canvas/canvasUtils";
import { useCanvasStore } from "../../stores/canvasStore";

interface UseCanvasDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  penColor: string;
  isDrawing: boolean;
  isEraser: boolean;
  isMagicWand: boolean;
  selectedComponentType: string | null;
  onCanvasStateChange?: (imageData: string | null) => void;
}

export function useCanvasDrawing({
  canvasRef,
  penColor,
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

  // Batch drawing operations using requestAnimationFrame
  const pendingDrawRef = useRef<{ from: Point; to: Point } | null>(null);
  const drawAnimationFrameRef = useRef<number | null>(null);
  const lastDrawTimeRef = useRef<number>(0);

  const drawLine = useCallback(
    (from: Point, to: Point) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const currentPenSize = useCanvasStore.getState().penSize;

      if (isEraser) {
        // Use destination-out composite for erasing
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = penColor;
      }

      // Use exact penSize for both drawing and erasing
      ctx.lineWidth = currentPenSize;

      // Use square caps for very small sizes to avoid oversized appearance
      // Round caps add radius that makes small lines appear much larger
      if (currentPenSize <= 2) {
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
    [penColor, isEraser, canvasRef],
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

  // Batched drawing function that processes pending draws
  const processPendingDraw = useCallback(() => {
    const pending = pendingDrawRef.current;
    if (!pending) {
      drawAnimationFrameRef.current = null;
      return;
    }

    const { from, to } = pending;
    pendingDrawRef.current = null;
    drawAnimationFrameRef.current = null;

    // Draw the line
    if (isDrawing || isEraser) {
      drawLine(from, to);
    } else if (isMagicWand) {
      drawLine(from, to);
    }
  }, [isDrawing, isEraser, isMagicWand, drawLine]);

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

      // Batch drawing operations using requestAnimationFrame for smooth 60fps updates
      const now = performance.now();
      const timeSinceLastDraw = now - lastDrawTimeRef.current;

      // Draw immediately if enough time has passed (throttle to ~60fps)
      // This ensures smooth drawing while preventing excessive canvas operations
      if (timeSinceLastDraw >= 16) {
        // If there's a pending draw, process it first to avoid gaps
        if (pendingDrawRef.current) {
          const pending = pendingDrawRef.current;
          if (isDrawing || isEraser) {
            drawLine(pending.from, pending.to);
          } else if (isMagicWand) {
            drawLine(pending.from, pending.to);
          }
          pendingDrawRef.current = null;
        }

        // Cancel any pending animation frame since we're drawing now
        if (drawAnimationFrameRef.current !== null) {
          cancelAnimationFrame(drawAnimationFrameRef.current);
          drawAnimationFrameRef.current = null;
        }

        // Draw current line immediately
        if (isDrawing || isEraser) {
          drawLine(lastPoint, point);
        } else if (isMagicWand) {
          drawLine(lastPoint, point);
        }

        lastDrawTimeRef.current = now;
      } else {
        // Schedule draw for next frame, but update the pending point
        // to ensure we always draw to the latest point
        pendingDrawRef.current = { from: lastPoint, to: point };

        if (drawAnimationFrameRef.current === null) {
          drawAnimationFrameRef.current = requestAnimationFrame(() => {
            processPendingDraw();
            lastDrawTimeRef.current = performance.now();
          });
        }
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
      processPendingDraw,
    ],
  );

  const handleCanvasMouseUp = useCallback(() => {
    // Process any pending draw before finishing
    if (pendingDrawRef.current && lastPointRef.current) {
      const pending = pendingDrawRef.current;
      if (isDrawing || isEraser) {
        drawLine(pending.from, pending.to);
      } else if (isMagicWand) {
        drawLine(pending.from, pending.to);
      }
      pendingDrawRef.current = null;
    }

    // Cancel any pending animation frame
    if (drawAnimationFrameRef.current !== null) {
      cancelAnimationFrame(drawAnimationFrameRef.current);
      drawAnimationFrameRef.current = null;
    }

    // Reset refs immediately (no re-render)
    isDraggingPenRef.current = false;
    lastPointRef.current = null;
    lastDrawTimeRef.current = 0;
    // Update state for external consumers
    setIsDraggingPen(false);

    // Save canvas state after drawing/erasing
    if (isDrawing || isEraser) {
      // Use setTimeout to ensure the drawing is complete
      setTimeout(() => {
        saveCanvasState();
      }, 0);
    }
  }, [isDrawing, isEraser, isMagicWand, saveCanvasState, drawLine]);

  return {
    isDraggingPen,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
  };
}
