import { Box } from "@mui/material";
import type { Point } from "../../utils/canvas/canvasUtils";

interface BrushPreviewProps {
  isDrawing: boolean;
  isEraser: boolean;
  isMagicWand: boolean;
  selectedComponentType: string | null;
  brushPosition: Point | null;
  penSize: number;
}

export default function BrushPreview({
  isDrawing,
  isEraser,
  isMagicWand,
  selectedComponentType,
  brushPosition,
  penSize,
}: BrushPreviewProps) {
  if (
    !(isDrawing || isEraser || isMagicWand) ||
    selectedComponentType ||
    !brushPosition
  ) {
    return null;
  }

  // For 1px, use a simple 1px point at exact cursor position
  if (penSize <= 1) {
    return (
      <Box
        sx={{
          position: "absolute",
          left: `${brushPosition.x}px`,
          top: `${brushPosition.y}px`,
          width: "1px",
          height: "1px",
          backgroundColor: isEraser
            ? "#f44336"
            : isMagicWand
              ? "#9c27b0"
              : "#1976d2",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />
    );
  }

  // For larger sizes, use a border to show the brush outline
  const borderWidth = penSize <= 2 ? 0.5 : 1;

  return (
    <Box
      sx={{
        position: "absolute",
        left: brushPosition.x - penSize / 2,
        top: brushPosition.y - penSize / 2,
        width: penSize,
        height: penSize,
        border: `${borderWidth}px solid`,
        borderColor: isEraser ? "#f44336" : isMagicWand ? "#9c27b0" : "#1976d2",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 3,
        boxSizing: "border-box",
        // Only show shadow for larger sizes
        boxShadow: penSize > 2 ? "0 0 0 1px rgba(0,0,0,0.1)" : "none",
      }}
    />
  );
}
