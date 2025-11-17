import { Box } from "@mui/material";
import type { CanvasComponent } from "../types/component";
import ComponentRenderer from "./ComponentRenderer";
import type { Point } from "../utils/canvasUtils";

interface ComponentOverlayProps {
  components: CanvasComponent[];
  isCursorMode: boolean;
  selectionBoxStart: Point | null;
  draggedComponentId: string | null;
  resizingComponentId: string | null;
  isDrawing: boolean;
  isEraser: boolean;
  isMagicWand: boolean;
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
  onComponentMouseDown: (e: React.MouseEvent, componentId: string) => void;
  onComponentUpdate?: (componentId: string, props: Partial<CanvasComponent["props"]>) => void;
  onOverlayClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function ComponentOverlay({
  components,
  isCursorMode,
  selectionBoxStart,
  draggedComponentId,
  resizingComponentId,
  isDrawing,
  isEraser,
  isMagicWand,
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
          (!isDrawing && !isEraser && !isMagicWand) || selectedComponentType
            ? "auto"
            : "none",
        zIndex: 2,
        cursor,
      }}
      onMouseDown={(e) => {
        if (isCursorMode && e.target === e.currentTarget) {
          const point = getPointFromEvent(e);
          onSelectionBoxStart(point);
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
        if (
          (isDrawing || isEraser || isMagicWand) &&
          !selectedComponentType
        ) {
          onBrushMouseMove(e);
        }
      }}
      onMouseUp={() => {
        onSelectionBoxFinish();
      }}
      onClick={onOverlayClick}
      onMouseLeave={() => {
        onBrushMouseLeave();
        onSelectionBoxClear();
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

