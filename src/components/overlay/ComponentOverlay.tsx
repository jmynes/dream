import { Box } from "@mui/material";
import { memo, useMemo } from "react";
import type { CanvasComponent } from "../../types/component";
import type { Point } from "../../utils/canvas/canvasUtils";
import ComponentRenderer from "../ComponentRenderer";

interface ComponentOverlayProps {
  components: CanvasComponent[];
  isCursorMode: boolean;
  isLassoMode: boolean;
  isTextSelectMode: boolean;
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
  onComponentMouseDown: (
    e: React.MouseEvent,
    componentId: string,
    resizeDirection?: string,
  ) => void;
  onComponentUpdate?: (
    componentId: string,
    props: Partial<CanvasComponent["props"]>,
  ) => void;
  onComponentColorChange?: (componentId: string, color: string) => void;
  onComponentDelete?: (componentId: string) => void;
  onComponentCopy?: (component: CanvasComponent) => void;
  onOverlayClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onResetTools?: () => void;
  onCellHighlight?: (point: Point) => void;
}

function ComponentOverlay({
  components,
  isCursorMode,
  isLassoMode,
  isTextSelectMode,
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
  onComponentColorChange,
  onComponentDelete,
  onComponentCopy,
  onOverlayClick,
  onContextMenu,
  onResetTools,
  onCellHighlight,
}: ComponentOverlayProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        maxHeight: "100%",
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
        // Middle mouse button (button === 1) to reset tools
        if (e.button === 1 && onResetTools) {
          e.preventDefault();
          onResetTools();
          return;
        }
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
        const point = getPointFromEvent(e);
        // Handle cell highlighting in cursor mode
        if (isCursorMode && onCellHighlight) {
          onCellHighlight(point);
        }
        if (
          isCursorMode &&
          selectionBoxStart &&
          !draggedComponentId &&
          !resizingComponentId
        ) {
          onSelectionBoxUpdate(point);
        }
        if (isLassoMode && isLassoDrawing) {
          onLassoUpdate(point);
        }
        if ((isDrawing || isEraser || isMagicWand) && !selectedComponentType) {
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
      onContextMenu={(e) => {
        // If right-clicking on empty space (overlay itself, not on components),
        // trigger the context menu handler
        if (e.target === e.currentTarget && onContextMenu) {
          onContextMenu(e);
        }
        // Components will stop propagation in their handleContextMenu
      }}
      onMouseLeave={() => {
        onBrushMouseLeave();
        // Clear cell highlight when mouse leaves overlay
        if (onCellHighlight) {
          onCellHighlight({ x: -1, y: -1 }); // Signal to clear
        }
        // Don't clear selection box on mouse leave - let it persist until mouseup
        // Only clear if we're not actively selecting
        if (!selectionBoxStart) {
          onSelectionBoxClear();
        }
        // Don't finish lasso on mouse leave - let it persist until mouseup
        // Lasso will be finished by global mouseup listener
      }}
    >
      {useMemo(
        () =>
          components.map((component) => (
            <ComponentRenderer
              key={component.id}
              component={component}
              onMouseDown={onComponentMouseDown}
              onComponentUpdate={onComponentUpdate}
              onComponentColorChange={onComponentColorChange}
              onComponentDelete={onComponentDelete}
              onComponentCopy={onComponentCopy}
              isTextSelectMode={isTextSelectMode}
              isDragging={draggedComponentId === component.id}
              isSelected={selectedComponentIds.includes(component.id)}
            />
          )),
        [
          components,
          onComponentMouseDown,
          onComponentUpdate,
          onComponentColorChange,
          onComponentDelete,
          onComponentCopy,
          isTextSelectMode,
          draggedComponentId,
          selectedComponentIds,
        ],
      )}
    </Box>
  );
}

// Memoize ComponentOverlay to prevent unnecessary re-renders
export default memo(ComponentOverlay, (prevProps, nextProps) => {
  // Only re-render if props that affect rendering actually changed
  if (
    prevProps.components !== nextProps.components ||
    prevProps.isCursorMode !== nextProps.isCursorMode ||
    prevProps.isLassoMode !== nextProps.isLassoMode ||
    prevProps.isTextSelectMode !== nextProps.isTextSelectMode ||
    prevProps.selectionBoxStart !== nextProps.selectionBoxStart ||
    prevProps.draggedComponentId !== nextProps.draggedComponentId ||
    prevProps.resizingComponentId !== nextProps.resizingComponentId ||
    prevProps.isDrawing !== nextProps.isDrawing ||
    prevProps.isEraser !== nextProps.isEraser ||
    prevProps.isMagicWand !== nextProps.isMagicWand ||
    prevProps.isLassoDrawing !== nextProps.isLassoDrawing ||
    prevProps.selectedComponentType !== nextProps.selectedComponentType ||
    prevProps.cursor !== nextProps.cursor ||
    prevProps.selectedComponentIds !== nextProps.selectedComponentIds
  ) {
    return false; // Props changed, need to re-render
  }
  return true; // Props are equal, skip re-render
});
