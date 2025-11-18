import { useCallback, useRef, useState } from "react";
import type { ComponentType } from "../../types/component";
import type { CanvasComponent } from "../../types/component";
import type { Point } from "../../utils/canvas/canvasUtils";
import { recognizeShape } from "../../utils/canvas/shapeRecognition";

interface UseMagicWandProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  components: CanvasComponent[];
  onComponentsChange: (components: CanvasComponent[]) => void;
  onComponentPlaced: () => void;
  gridCellWidth: number;
  gridCellHeight: number;
  snapToGridPoint: (point: Point) => Point;
}

export function useMagicWand({
  canvasRef,
  components,
  onComponentsChange,
  onComponentPlaced,
  gridCellWidth,
  gridCellHeight,
  snapToGridPoint,
}: UseMagicWandProps) {
  const magicWandPathRef = useRef<Point[]>([]);
  const hasDrawingRef = useRef(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const savedCanvasStateRef = useRef<ImageData | null>(null);
  const [pendingRecognition, setPendingRecognition] = useState<{
    type: ComponentType;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [recognitionFailed, setRecognitionFailed] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const addPathPoint = useCallback((point: Point) => {
    // Update ref immediately (no re-render)
    if (magicWandPathRef.current.length === 0) {
      // Save canvas state before starting to draw
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          savedCanvasStateRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
      }
      magicWandPathRef.current = [point];
      // Only update state when transitioning from no drawing to drawing
      if (!hasDrawingRef.current) {
        hasDrawingRef.current = true;
        setHasDrawing(true);
      }
    } else {
      magicWandPathRef.current.push(point);
      // No state update needed - already drawing
    }
  }, [canvasRef]);

  const handleRecognizePath = useCallback(() => {
    if (magicWandPathRef.current.length === 0) return;

    const recognizedType = recognizeShape(magicWandPathRef.current);

    // Calculate bounding box for placement
    const path = magicWandPathRef.current;
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const point of path) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }

    const width = Math.max(maxX - minX, gridCellWidth);
    const height = Math.max(maxY - minY, gridCellHeight);
    const snappedPoint = snapToGridPoint({ x: minX, y: minY });

    if (recognizedType) {
      // Store pending recognition
      setPendingRecognition({
        type: recognizedType,
        x: snappedPoint.x,
        y: snappedPoint.y,
        width: width,
        height: height,
      });
      setRecognitionFailed(null);
    } else {
      // Show UI for manual component selection when recognition fails
      setRecognitionFailed({
        x: snappedPoint.x,
        y: snappedPoint.y,
        width: width,
        height: height,
      });
      setPendingRecognition(null);
    }
  }, [snapToGridPoint, gridCellWidth, gridCellHeight]);

  const handleSubmitRecognition = useCallback(() => {
    // If no pending recognition but we have a path, recognize first
    if (!pendingRecognition && magicWandPathRef.current.length > 0) {
      handleRecognizePath();
      return;
    }

    if (!pendingRecognition) return;

    // Clear the drawn shape from canvas by restoring saved state
    const canvas = canvasRef.current;
    if (canvas && savedCanvasStateRef.current) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Restore the canvas state from before we started drawing
        ctx.putImageData(savedCanvasStateRef.current, 0, 0);
        savedCanvasStateRef.current = null;
      }
    }

    // Place the component
    const newComponent: CanvasComponent = {
      id: `component-${Date.now()}`,
      type: pendingRecognition.type,
      x: pendingRecognition.x,
      y: pendingRecognition.y,
      width: pendingRecognition.width,
      height: pendingRecognition.height,
      props: {},
    };
    onComponentsChange([...components, newComponent]);
    onComponentPlaced();

    // Clear pending recognition and path
    setPendingRecognition(null);
    setRecognitionFailed(null);
    magicWandPathRef.current = [];
    hasDrawingRef.current = false;
    setHasDrawing(false);
  }, [
    pendingRecognition,
    handleRecognizePath,
    components,
    onComponentsChange,
    onComponentPlaced,
    canvasRef,
  ]);

  const handleSelectComponentType = useCallback(
    (type: ComponentType) => {
      if (!recognitionFailed) return;

      setPendingRecognition({
        type: type,
        x: recognitionFailed.x,
        y: recognitionFailed.y,
        width: recognitionFailed.width,
        height: recognitionFailed.height,
      });
      setRecognitionFailed(null);
    },
    [recognitionFailed],
  );

  const handleCancelRecognition = useCallback(() => {
    // Clear the drawn shape from canvas by restoring saved state
    const canvas = canvasRef.current;
    if (canvas && savedCanvasStateRef.current) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Restore the canvas state from before we started drawing
        ctx.putImageData(savedCanvasStateRef.current, 0, 0);
        savedCanvasStateRef.current = null;
      }
    }

    // Clear pending recognition and path
    setPendingRecognition(null);
    setRecognitionFailed(null);
    magicWandPathRef.current = [];
    hasDrawingRef.current = false;
    setHasDrawing(false);
  }, [canvasRef]);

  return {
    hasDrawing,
    pendingRecognition,
    recognitionFailed,
    addPathPoint,
    handleRecognizePath,
    handleSubmitRecognition,
    handleSelectComponentType,
    handleCancelRecognition,
  };
}
