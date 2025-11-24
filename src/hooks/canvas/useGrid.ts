import { useMemo } from "react";

interface UseGridProps {
  width: number;
  height: number;
}

const GRID_COLUMNS = 12;
const GRID_ROWS = 28;
const BASE_CELL_HEIGHT = 40;

export function useGrid({ width, height }: UseGridProps) {
  const { gridCellWidth, gridCellHeight, canvasWidth, canvasHeight } = useMemo(() => {
    // Calculate cell width based on available width, divided by columns
    const cellWidth = Math.floor(width / GRID_COLUMNS);
    // Use fixed cell height
    const cellHeight = BASE_CELL_HEIGHT;
    
    // Calculate canvas dimensions based on fixed grid
    const calculatedCanvasWidth = cellWidth * GRID_COLUMNS;
    const calculatedCanvasHeight = cellHeight * GRID_ROWS;
    
    return {
      gridCellWidth: cellWidth,
      gridCellHeight: cellHeight,
      canvasWidth: calculatedCanvasWidth,
      canvasHeight: calculatedCanvasHeight,
    };
  }, [width, height]);

  return { gridCellWidth, gridCellHeight, canvasWidth, canvasHeight };
}
