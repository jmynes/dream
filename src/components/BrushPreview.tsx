import { Box } from "@mui/material";
import type { Point } from "../utils/canvasUtils";

interface BrushPreviewProps {
  isDrawing: boolean;
  isEraser: boolean;
  isThinkingPen: boolean;
  selectedComponentType: string | null;
  brushPosition: Point | null;
  penSize: number;
}

export default function BrushPreview({
  isDrawing,
  isEraser,
  isThinkingPen,
  selectedComponentType,
  brushPosition,
  penSize,
}: BrushPreviewProps) {
  if (
    !(isDrawing || isEraser || isThinkingPen) ||
    selectedComponentType ||
    !brushPosition
  ) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "absolute",
        left: brushPosition.x - penSize / 2,
        top: brushPosition.y - penSize / 2,
        width: penSize,
        height: penSize,
        border: "1px solid",
        borderColor: isEraser
          ? "#f44336"
          : isThinkingPen
            ? "#9c27b0"
            : "#1976d2",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 3,
        boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
      }}
    />
  );
}
