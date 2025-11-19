import { Box } from "@mui/material";
import { memo } from "react";

interface GridOverlayProps {
  snapToGrid: boolean;
  gridCellWidth: number;
  gridCellHeight: number;
}

function GridOverlay({
  snapToGrid,
  gridCellWidth,
  gridCellHeight,
}: GridOverlayProps) {
  if (!snapToGrid) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        backgroundImage: `
					linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
					linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
				`,
        backgroundSize: `${gridCellWidth}px ${gridCellHeight}px`,
      }}
    />
  );
}

// Memoize GridOverlay to prevent unnecessary re-renders
export default memo(GridOverlay, (prevProps, nextProps) => {
  return (
    prevProps.snapToGrid === nextProps.snapToGrid &&
    prevProps.gridCellWidth === nextProps.gridCellWidth &&
    prevProps.gridCellHeight === nextProps.gridCellHeight
  );
});
