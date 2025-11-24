import { Box } from "@mui/material";
import { memo } from "react";

interface CellHighlightProps {
  x: number;
  y: number;
  cellWidth: number;
  cellHeight: number;
  visible: boolean;
}

function CellHighlight({
  x,
  y,
  cellWidth,
  cellHeight,
  visible,
}: CellHighlightProps) {
  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: cellWidth,
        height: cellHeight,
        backgroundColor: "rgba(25, 118, 210, 0.2)",
        border: "1px solid rgba(25, 118, 210, 0.5)",
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
}

export default memo(CellHighlight);

