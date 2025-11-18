import { useCallback, useEffect, useRef, useState } from "react";
import type { Point } from "../../utils/canvas/canvasUtils";

interface UseBrushPreviewProps {
  isDrawing: boolean;
  isEraser: boolean;
  isMagicWand: boolean;
  selectedComponentType: string | null;
  getPointFromEvent: (e: React.MouseEvent | MouseEvent) => Point;
}

export function useBrushPreview({
  isDrawing,
  isEraser,
  isMagicWand,
  selectedComponentType,
  getPointFromEvent,
}: UseBrushPreviewProps) {
  const [brushPosition, setBrushPosition] = useState<Point | null>(null);
  const brushAnimationFrameRef = useRef<number | null>(null);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (brushAnimationFrameRef.current !== null) {
        cancelAnimationFrame(brushAnimationFrameRef.current);
      }
    };
  }, []);

  const handleBrushMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement | HTMLDivElement>) => {
      if ((isDrawing || isEraser || isMagicWand) && !selectedComponentType) {
        const point = getPointFromEvent(e);
        if (brushAnimationFrameRef.current !== null) {
          cancelAnimationFrame(brushAnimationFrameRef.current);
        }
        brushAnimationFrameRef.current = requestAnimationFrame(() => {
          setBrushPosition(point);
          brushAnimationFrameRef.current = null;
        });
      }
    },
    [
      isDrawing,
      isEraser,
      isMagicWand,
      selectedComponentType,
      getPointFromEvent,
    ],
  );

  const handleBrushMouseLeave = useCallback(() => {
    if (brushAnimationFrameRef.current !== null) {
      cancelAnimationFrame(brushAnimationFrameRef.current);
      brushAnimationFrameRef.current = null;
    }
    setBrushPosition(null);
  }, []);

  return {
    brushPosition,
    handleBrushMouseMove,
    handleBrushMouseLeave,
  };
}

