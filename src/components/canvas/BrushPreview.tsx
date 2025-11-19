import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { Point } from "../../utils/canvas/canvasUtils";
import { usePenSizeValue } from "../../stores/canvasStore";

interface BrushPreviewProps {
  isDrawing: boolean;
  isEraser: boolean;
  isMagicWand: boolean;
  selectedComponentType: string | null;
  brushPosition: Point | null;
}

function BrushPreview({
  isDrawing,
  isEraser,
  isMagicWand,
  selectedComponentType,
  brushPosition,
}: BrushPreviewProps) {
  const penSize = usePenSizeValue();
  const [renderPenSize, setRenderPenSize] = useState(penSize);
  const pendingSizeRaf = useRef<number | null>(null);

  useEffect(() => {
    if (renderPenSize === penSize) {
      return undefined;
    }
    if (pendingSizeRaf.current !== null) {
      cancelAnimationFrame(pendingSizeRaf.current);
    }
    pendingSizeRaf.current = requestAnimationFrame(() => {
      setRenderPenSize(penSize);
      pendingSizeRaf.current = null;
    });
    return () => {
      if (pendingSizeRaf.current !== null) {
        cancelAnimationFrame(pendingSizeRaf.current);
        pendingSizeRaf.current = null;
      }
    };
  }, [penSize, renderPenSize]);

  const brushColor = useMemo(() => {
    if (isEraser) return "#f44336";
    if (isMagicWand) return "#9c27b0";
    return "#1976d2";
  }, [isEraser, isMagicWand]);

  const shouldShowBrush =
    (isDrawing || isEraser || isMagicWand) && !selectedComponentType;

  const previewConfig = useMemo(() => {
    if (!shouldShowBrush || !brushPosition) {
      return null;
    }

    if (renderPenSize <= 1) {
      return {
        type: "dot" as const,
        style: {
          position: "absolute" as const,
          left: `${brushPosition.x}px`,
          top: `${brushPosition.y}px`,
          width: "1px",
          height: "1px",
          backgroundColor: brushColor,
          pointerEvents: "none" as const,
          zIndex: 3,
        },
      };
    }

    const borderWidth = renderPenSize <= 2 ? 0.5 : 1;
    const size = renderPenSize;

    return {
      type: "circle" as const,
      style: {
        position: "absolute" as const,
        transform: `translate3d(${brushPosition.x - size / 2}px, ${brushPosition.y - size / 2}px, 0)`,
        width: `${size}px`,
        height: `${size}px`,
        border: `${borderWidth}px solid ${brushColor}`,
        borderRadius: "50%",
        pointerEvents: "none" as const,
        zIndex: 3,
        boxSizing: "border-box" as const,
        boxShadow: size > 2 ? "0 0 0 1px rgba(0,0,0,0.1)" : "none",
        willChange: "transform,width,height",
      },
    };
  }, [shouldShowBrush, brushPosition, renderPenSize, brushColor]);

  if (!previewConfig) {
    return null;
  }

  return (
    <div style={previewConfig.style} />
  );
}

// Memoize BrushPreview to prevent unnecessary re-renders
export default memo(BrushPreview, (prevProps, nextProps) => {
  return (
    prevProps.isDrawing === nextProps.isDrawing &&
    prevProps.isEraser === nextProps.isEraser &&
    prevProps.isMagicWand === nextProps.isMagicWand &&
    prevProps.selectedComponentType === nextProps.selectedComponentType &&
    prevProps.brushPosition === nextProps.brushPosition
  );
});
