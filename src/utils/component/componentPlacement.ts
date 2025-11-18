import type { CanvasComponent, ComponentType } from "../../types/component";
import type { Point } from "../canvas/canvasUtils";

export function createComponentAtPoint(
  type: ComponentType,
  point: Point,
  gridCellWidth: number,
  gridCellHeight: number,
  color?: string,
): CanvasComponent {
  // Set default dimensions based on component type
  let defaultWidth = gridCellWidth;
  let defaultHeight = gridCellHeight;

  if (type === "Radio") {
    // Radio: 1 wide, 2 high
    defaultWidth = gridCellWidth;
    defaultHeight = gridCellHeight * 2;
  } else if (type === "Table") {
    // Table: 3 wide, 3 high
    defaultWidth = gridCellWidth * 3;
    defaultHeight = gridCellHeight * 3;
  }

  return {
    id: `component-${Date.now()}`,
    type,
    x: point.x,
    y: point.y,
    width: defaultWidth,
    height: defaultHeight,
    color,
    props: {},
  };
}

