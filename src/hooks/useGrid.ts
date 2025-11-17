import { useMemo } from "react";

interface UseGridProps {
  width: number;
  height: number;
}

const GRID_COLUMNS = 12;
const BASE_ROW_HEIGHT = 40;

export function useGrid({ width, height }: UseGridProps) {
  const { gridCellWidth, gridCellHeight } = useMemo(() => {
    const cellWidth = Math.floor(width / GRID_COLUMNS);
    const rows = Math.max(1, Math.floor(height / BASE_ROW_HEIGHT));
    const cellHeight = Math.floor(height / rows);
    return {
      gridCellWidth: cellWidth,
      gridCellHeight: cellHeight,
    };
  }, [width, height]);

  return { gridCellWidth, gridCellHeight };
}

