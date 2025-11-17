import type { CanvasComponent, ComponentType } from "../types/component";
import type { Point } from "./canvasUtils";

export function createComponentAtPoint(
  type: ComponentType,
  point: Point,
  gridCellWidth: number,
  gridCellHeight: number,
  color?: string,
): CanvasComponent {
  return {
    id: `component-${Date.now()}`,
    type,
    x: point.x,
    y: point.y,
    width: gridCellWidth,
    height: gridCellHeight,
    color,
    props: {},
  };
}

