import { useCallback, useRef, useState } from "react";
import { getStroke } from "perfect-freehand";
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

const MIN_POINT_DISTANCE = 0.5;

const strokeToPath = (stroke: number[][]) => {
  if (!stroke.length) {
    return "";
  }

  const d = stroke.reduce((acc, [x0, y0], i, arr) => {
    const [x1, y1] = arr[(i + 1) % arr.length];
    const midX = (x0 + x1) / 2;
    const midY = (y0 + y1) / 2;
    return `${acc} Q ${x0.toFixed(2)} ${y0.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }, `M ${stroke[0][0].toFixed(2)} ${stroke[0][1].toFixed(2)}`);

  return `${d} Z`;
};

export function useCanvasDrawing({
  canvasRef,
  penColor,
  isDrawing,
  isEraser,
  isMagicWand,
  selectedComponentType,
  onCanvasStateChange,
}: UseCanvasDrawingProps) {
  const isDraggingPenRef = useRef(false);
  const [isDraggingPen, setIsDraggingPen] = useState(false);
  const strokePointsRef = useRef<Point[]>([]);
  const canvasSnapshotRef = useRef<ImageData | null>(null);

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onCanvasStateChange) return;

    const imageData = canvas.toDataURL();
    onCanvasStateChange(imageData);
  }, [onCanvasStateChange, canvasRef]);

  const drawSmoothStroke = useCallback(
    (points: Point[]) => {
      if (points.length === 0) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const penSize = useCanvasStore.getState().penSize;
      const stroke = getStroke(
        points.map((p) => [p.x, p.y]),
        {
          size: penSize,
          thinning: 0.6,
          smoothing: 0.65,
          streamline: 0.4,
          easing: (t) => t,
          simulatePressure: false,
        },
      );

      const path = strokeToPath(stroke);
      if (!path) return;

      const path2d = new Path2D(path);
      ctx.save();
      ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
      ctx.fillStyle = isEraser ? "#000" : penColor;
      ctx.fill(path2d);
      ctx.restore();
    },
    [canvasRef, isEraser, penColor],
  );

  const restoreSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    const snapshot = canvasSnapshotRef.current;
    if (!canvas || !snapshot) return false;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.putImageData(snapshot, 0, 0);
    return true;
  }, [canvasRef]);

  const updateStrokePreview = useCallback(() => {
    const points = strokePointsRef.current;
    if (points.length === 0) return;
    restoreSnapshot();
    drawSmoothStroke(points);
  }, [restoreSnapshot, drawSmoothStroke]);

  const handleCanvasMouseDown = useCallback(
    (point: Point) => {
      if ((!isDrawing && !isEraser && !isMagicWand) || selectedComponentType)
        return;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          try {
            canvasSnapshotRef.current = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            );
          } catch {
            canvasSnapshotRef.current = null;
          }
        }
      }

      strokePointsRef.current = [point];
      isDraggingPenRef.current = true;
      setIsDraggingPen(true);
      updateStrokePreview();
    },
    [
      isDrawing,
      isEraser,
      isMagicWand,
      selectedComponentType,
      canvasRef,
      updateStrokePreview,
    ],
  );

  const handleCanvasMouseMove = useCallback(
    (point: Point, onPathPoint?: (point: Point) => void) => {
      if (
        !isDraggingPenRef.current ||
        (!isDrawing && !isEraser && !isMagicWand) ||
        selectedComponentType
      ) {
        return;
      }

      const points = strokePointsRef.current;
      const lastPoint = points[points.length - 1];
      if (
        !lastPoint ||
        Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) >
          MIN_POINT_DISTANCE
      ) {
        points.push(point);
      }

      if (isMagicWand && onPathPoint) {
        onPathPoint(point);
      }

      updateStrokePreview();
    },
    [
      isDrawing,
      isEraser,
      isMagicWand,
      selectedComponentType,
      updateStrokePreview,
    ],
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (!isDraggingPenRef.current) {
      return;
    }

    isDraggingPenRef.current = false;
    setIsDraggingPen(false);

    if (strokePointsRef.current.length > 0) {
      restoreSnapshot();
      drawSmoothStroke(strokePointsRef.current);
      strokePointsRef.current = [];
    }
    canvasSnapshotRef.current = null;

    if (isDrawing || isEraser) {
      setTimeout(() => {
        saveCanvasState();
      }, 0);
    }
  }, [isDrawing, isEraser, restoreSnapshot, drawSmoothStroke, saveCanvasState]);

  return {
    isDraggingPen,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
  };
}
