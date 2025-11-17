import { Box } from "@mui/material";
import type { CanvasComponent } from "../types/component";
import ComponentRenderer from "./ComponentRenderer";
import type { Point } from "../utils/canvasUtils";

interface ComponentOverlayProps {
  components: CanvasComponent[];
  isCursorMode: boolean;
  isLassoMode: boolean;
  selectionBoxStart: Point | null;
  draggedComponentId: string | null;
  resizingComponentId: string | null;
  isDrawing: boolean;
  isEraser: boolean;
  isMagicWand: boolean;
  isLassoDrawing: boolean;
  selectedComponentType: string | null;
  cursor: string;
  selectedComponentIds: string[];
  getPointFromEvent: (e: React.MouseEvent) => Point;
  onSelectionBoxStart: (point: Point) => void;
  onSelectionBoxUpdate: (point: Point) => void;
  onSelectionBoxFinish: () => void;
  onSelectionBoxClear: () => void;
  onBrushMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onBrushMouseLeave: () => void;
  onLassoStart: (point: Point) => void;
  onLassoUpdate: (point: Point) => void;
  onLassoFinish: () => void;
  onComponentMouseDown: (e: React.MouseEvent, componentId: string, resizeDirection?: string) => void;
  onComponentUpdate?: (componentId: string, props: Partial<CanvasComponent["props"]>) => void;
  onOverlayClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function ComponentOverlay({
  components,
  isCursorMode,
  isLassoMode,
  selectionBoxStart,
  draggedComponentId,
  resizingComponentId,
  isDrawing,
  isEraser,
  isMagicWand,
  isLassoDrawing,
  selectedComponentType,
  cursor,
  selectedComponentIds,
  getPointFromEvent,
  onSelectionBoxStart,
  onSelectionBoxUpdate,
  onSelectionBoxFinish,
  onSelectionBoxClear,
  onBrushMouseMove,
  onBrushMouseLeave,
  onLassoStart,
  onLassoUpdate,
  onLassoFinish,
  onComponentMouseDown,
  onComponentUpdate,
  onOverlayClick,
}: ComponentOverlayProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents:
          (!isDrawing && !isEraser && !isMagicWand) ||
          selectedComponentType ||
          isLassoMode
            ? "auto"
            : "none",
        zIndex: 2,
        cursor,
      }}
      onMouseDown={(e) => {
        if (isCursorMode && e.target === e.currentTarget) {
          const point = getPointFromEvent(e);
          onSelectionBoxStart(point);
          return;
        }
        if (isLassoMode && e.target === e.currentTarget) {
          const point = getPointFromEvent(e);
          onLassoStart(point);
        }
      }}
      onMouseMove={(e) => {
        if (
          isCursorMode &&
          selectionBoxStart &&
          !draggedComponentId &&
          !resizingComponentId
        ) {
          const point = getPointFromEvent(e);
          onSelectionBoxUpdate(point);
        }
        if (isLassoMode && isLassoDrawing) {
          const point = getPointFromEvent(e);
          onLassoUpdate(point);
        }
        if (
          (isDrawing || isEraser || isMagicWand) &&
          !selectedComponentType
        ) {
          onBrushMouseMove(e);
        }
      }}
      onMouseUp={() => {
        if (isLassoDrawing) {
          onLassoFinish();
          return;
        }
        // Don't finish selection box if we're resizing
        if (!resizingComponentId) {
          onSelectionBoxFinish();
        }
      }}
      onClick={onOverlayClick}
      onMouseLeave={() => {
        onBrushMouseLeave();
        onSelectionBoxClear();
        if (isLassoDrawing) {
          onLassoFinish();
        }
      }}
    >
      {components.map((component) => (
        <ComponentRenderer
          key={component.id}
          component={component}
          onMouseDown={onComponentMouseDown}
          onComponentUpdate={onComponentUpdate}
          isDragging={draggedComponentId === component.id}
          isSelected={selectedComponentIds.includes(component.id)}
        />
      ))}
    </Box>
  );
}

