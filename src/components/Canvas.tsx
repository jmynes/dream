import { Box, Button, Paper } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CanvasComponent, ComponentType } from "../types/component";
import RecognitionUI from "./RecognitionUI";
import GridOverlay from "./GridOverlay";
import BrushPreview from "./BrushPreview";
import SelectionBox from "./SelectionBox";
import ComponentOverlay from "./ComponentOverlay";
import {
  getPointFromEvent,
  snapToGridPoint,
  type Point,
} from "../utils/canvasUtils";
import { createComponentAtPoint } from "../utils/componentPlacement";
import { useCanvasLifecycle } from "../hooks/useCanvasLifecycle";
import { useGrid } from "../hooks/useGrid";
import { useBrushPreview } from "../hooks/useBrushPreview";
import { useCanvasDrawing } from "../hooks/useCanvasDrawing";
import { useSelectionBox } from "../hooks/useSelectionBox";
import { useComponentDragResize } from "../hooks/useComponentDragResize";
import { useThinkingPen } from "../hooks/useThinkingPen";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

interface CanvasProps {
  width?: number;
  height?: number;
  penColor?: string;
  componentColor?: string;
  penSize?: number;
  isDrawing?: boolean;
  isEraser?: boolean;
  isThinkingPen?: boolean;
  components: CanvasComponent[];
  onComponentsChange: (components: CanvasComponent[]) => void;
  selectedComponentType: ComponentType | null;
  onComponentPlaced: () => void;
  snapToGrid?: boolean;
  resizeMode?: "relative" | "clone";
  onCanvasStateChange?: (imageData: string | null) => void;
  restoreCanvasImageData?: string | null;
}

export default function Canvas({
  width = 800,
  height = 600,
  penColor = "#1976d2",
  componentColor = "#1976d2",
  penSize = 2,
  isDrawing = true,
  isEraser = false,
  isThinkingPen = false,
  components,
  onComponentsChange,
  selectedComponentType,
  onComponentPlaced,
  snapToGrid = false,
  resizeMode = "relative",
  onCanvasStateChange,
  restoreCanvasImageData,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>(
    [],
  );

  // Canvas lifecycle management
  const { actualWidth, actualHeight } = useCanvasLifecycle({
    canvasRef,
    containerRef,
    width,
    height,
    restoreCanvasImageData,
  });

  // Grid calculation
  const { gridCellWidth, gridCellHeight } = useGrid({
    width: actualWidth,
    height: actualHeight,
  });

  // Create snapToGridPoint function
  const snapToGridPointFn = useCallback(
    (point: Point) =>
      snapToGridPoint(point, snapToGrid, gridCellWidth, gridCellHeight),
    [snapToGrid, gridCellWidth, gridCellHeight],
  );

  // Create getPointFromEvent function
  const getPointFromEventFn = useCallback(
    (e: React.MouseEvent | MouseEvent) =>
      getPointFromEvent(e, containerRef.current),
    [],
  );

  // Canvas drawing hook
  const {
    handleCanvasMouseDown: handleCanvasMouseDownBase,
    handleCanvasMouseMove: handleCanvasMouseMoveBase,
    handleCanvasMouseUp: handleCanvasMouseUpBase,
  } = useCanvasDrawing({
    canvasRef,
    penColor,
    penSize,
    isDrawing,
    isEraser,
    isThinkingPen,
    selectedComponentType,
    onCanvasStateChange,
  });

  // Thinking pen hook
  const {
    hasDrawing,
    pendingRecognition,
    recognitionFailed,
    addPathPoint,
    handleRecognizePath,
    handleSubmitRecognition,
    handleSelectComponentType,
    handleCancelRecognition,
  } = useThinkingPen({
    canvasRef,
    penSize,
    components,
    onComponentsChange,
    onComponentPlaced,
    gridCellWidth,
    gridCellHeight,
    snapToGridPoint: snapToGridPointFn,
  });

  // Selection box hook
  const {
    selectionBoxStart,
    selectionBoxEnd,
    selectionBoxEndRef,
    isCursorMode,
    startSelectionBox,
    updateSelectionBox,
    finishSelectionBox,
    clearSelectionBox,
    checkJustFinishedSelectionBox,
  } = useSelectionBox({
    isDrawing,
    isEraser,
    isThinkingPen,
    selectedComponentType,
    components,
    onSelectionChange: setSelectedComponentIds,
  });

  // Component drag/resize hook
  const {
    draggedComponentId,
    resizingComponentId,
    handleComponentMouseDown: handleComponentMouseDownBase,
    handleContainerMouseMove: handleContainerMouseMoveBase,
    handleContainerMouseUp: handleContainerMouseUpBase,
  } = useComponentDragResize({
    components,
    onComponentsChange,
    selectedComponentIds,
    snapToGrid,
    gridCellWidth,
    gridCellHeight,
    resizeMode,
    snapToGridPoint: snapToGridPointFn,
  });

  // Brush preview hook
  const {
    brushPosition,
    handleBrushMouseMove,
    handleBrushMouseLeave,
  } = useBrushPreview({
    isDrawing,
    isEraser,
    isThinkingPen,
    selectedComponentType,
    getPointFromEvent: getPointFromEventFn,
  });

  // Clear pending recognition when thinking pen is disabled
  useEffect(() => {
    if (
      !isThinkingPen &&
      (pendingRecognition || recognitionFailed || hasDrawing)
    ) {
      handleCancelRecognition();
    }
  }, [
    isThinkingPen,
    pendingRecognition,
    recognitionFailed,
    hasDrawing,
    handleCancelRecognition,
  ]);

  // Canvas mouse handlers
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getPointFromEventFn(e);
      handleCanvasMouseDownBase(point);
      if (isThinkingPen) {
        addPathPoint(point);
      }
    },
    [
      getPointFromEventFn,
      handleCanvasMouseDownBase,
      isThinkingPen,
      addPathPoint,
    ],
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getPointFromEventFn(e);
      handleCanvasMouseMoveBase(
        point,
        isThinkingPen ? addPathPoint : undefined,
      );
    },
    [
      getPointFromEventFn,
      handleCanvasMouseMoveBase,
      isThinkingPen,
      addPathPoint,
    ],
  );

  // Component placement handlers
  const placeComponent = useCallback(
    (point: Point) => {
      if (!selectedComponentType) return;
      const snappedPoint = snapToGridPointFn(point);
      const newComponent = createComponentAtPoint(
        selectedComponentType,
        snappedPoint,
        gridCellWidth,
        gridCellHeight,
        componentColor,
      );
      onComponentsChange([...components, newComponent]);
      onComponentPlaced();
    },
    [
      selectedComponentType,
      snapToGridPointFn,
      gridCellWidth,
      gridCellHeight,
      componentColor,
      components,
      onComponentsChange,
      onComponentPlaced,
    ],
  );

  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && selectedComponentType) {
        const point = getPointFromEventFn(e);
        placeComponent(point);
      }
    },
    [selectedComponentType, getPointFromEventFn, placeComponent],
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        if (checkJustFinishedSelectionBox()) {
          return;
        }
        if (isCursorMode) {
          setSelectedComponentIds([]);
          return;
        }
        if (selectedComponentType) {
          const point = getPointFromEventFn(e);
          placeComponent(point);
        }
      }
    },
    [
      checkJustFinishedSelectionBox,
      isCursorMode,
      selectedComponentType,
      getPointFromEventFn,
      placeComponent,
    ],
  );

  // Component mouse down handler
  const handleComponentMouseDown = useCallback(
    (e: React.MouseEvent, componentId: string) => {
      const point = getPointFromEventFn(e);
      handleComponentMouseDownBase(
        e,
        componentId,
        point,
        isEraser,
        setSelectedComponentIds,
      );
    },
    [getPointFromEventFn, handleComponentMouseDownBase, isEraser],
  );

  // Container mouse handlers
  // Note: Selection box is handled by ComponentOverlay in cursor mode
  // These handlers are only needed for drag/resize which must work outside component bounds
  const handleContainerMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const point = getPointFromEventFn(e);
      // Handle drag/resize (needed even when dragging outside component bounds)
      handleContainerMouseMoveBase(point);
    },
    [getPointFromEventFn, handleContainerMouseMoveBase],
  );

  const handleContainerMouseUp = useCallback(() => {
    handleContainerMouseUpBase();
  }, [handleContainerMouseUpBase]);

  // Handle clicking on canvas background to deselect
  const handleCanvasBackgroundClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          setSelectedComponentIds([]);
        }
        if (pendingRecognition || recognitionFailed || hasDrawing) {
          handleCancelRecognition();
        }
      }
    },
    [
      pendingRecognition,
      recognitionFailed,
      hasDrawing,
      handleCancelRecognition,
    ],
  );

  // Handle drag and drop from sidebar
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const componentType = e.dataTransfer.getData(
        "componentType",
      ) as ComponentType;
      if (!componentType) return;

      const point = getPointFromEventFn(e);
      const snappedPoint = snapToGridPointFn(point);
      const newComponent = createComponentAtPoint(
        componentType,
        snappedPoint,
        gridCellWidth,
        gridCellHeight,
        componentColor,
      );
      onComponentsChange([...components, newComponent]);
      onComponentPlaced();
    },
    [
      getPointFromEventFn,
      snapToGridPointFn,
      gridCellWidth,
      gridCellHeight,
      componentColor,
      components,
      onComponentsChange,
      onComponentPlaced,
    ],
  );

  // Keyboard shortcuts hook
  useKeyboardShortcuts({
    components,
    selectedComponentIds,
    isThinkingPen,
    pendingRecognition,
    recognitionFailed,
    hasDrawing,
    onSelectAll: () => {
      if (components.length > 0) {
        setSelectedComponentIds(components.map((c) => c.id));
      }
    },
    onDeleteSelected: () => {
      onComponentsChange(
        components.filter((c) => !selectedComponentIds.includes(c.id)),
      );
      setSelectedComponentIds([]);
    },
    onDeselectAll: () => {
      setSelectedComponentIds([]);
    },
    onRecognizePath: handleRecognizePath,
    onSubmitRecognition: handleSubmitRecognition,
    onCancelRecognition: handleCancelRecognition,
  });

  // Hide default cursor when showing brush preview
  const cursor =
    (isDrawing || isEraser || isThinkingPen) && !selectedComponentType
      ? "none"
      : selectedComponentType
        ? "crosshair"
        : "default";

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        overflow: "hidden",
        cursor,
        width: "100%",
        height: "100%",
      }}
      onClick={(e) => {
        handleContainerClick(e);
        handleCanvasBackgroundClick(e);
      }}
      onMouseMove={handleContainerMouseMove}
      onMouseUp={handleContainerMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={(e) => {
          handleCanvasMouseMove(e);
          handleBrushMouseMove(e);
        }}
        onMouseUp={handleCanvasMouseUpBase}
        onMouseLeave={handleBrushMouseLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "block",
          width: "100%",
          height: "100%",
          pointerEvents:
            (isDrawing || isEraser || isThinkingPen) && !selectedComponentType
              ? "auto"
              : "none",
          cursor,
        }}
      />

      <GridOverlay
        snapToGrid={snapToGrid}
        gridCellWidth={gridCellWidth}
        gridCellHeight={gridCellHeight}
      />

      <BrushPreview
        isDrawing={isDrawing}
        isEraser={isEraser}
        isThinkingPen={isThinkingPen}
        selectedComponentType={selectedComponentType}
        brushPosition={brushPosition}
        penSize={penSize}
      />

      <SelectionBox start={selectionBoxStart} end={selectionBoxEnd} endRef={selectionBoxEndRef} />

      <ComponentOverlay
        components={components}
        isCursorMode={isCursorMode}
        selectionBoxStart={selectionBoxStart}
        draggedComponentId={draggedComponentId}
        resizingComponentId={resizingComponentId}
        isDrawing={isDrawing}
        isEraser={isEraser}
        isThinkingPen={isThinkingPen}
        selectedComponentType={selectedComponentType}
        cursor={cursor}
        selectedComponentIds={selectedComponentIds}
        getPointFromEvent={getPointFromEventFn}
        onSelectionBoxStart={startSelectionBox}
        onSelectionBoxUpdate={(point) =>
          updateSelectionBox(point, draggedComponentId, resizingComponentId)
        }
        onSelectionBoxFinish={finishSelectionBox}
        onSelectionBoxClear={clearSelectionBox}
        onBrushMouseMove={handleBrushMouseMove}
        onBrushMouseLeave={handleBrushMouseLeave}
        onComponentMouseDown={handleComponentMouseDown}
        onOverlayClick={handleOverlayClick}
      />

      {/* Submit button for thinking pen - shown when drawing */}
      {isThinkingPen &&
        hasDrawing &&
        !pendingRecognition &&
        !recognitionFailed && (
          <Paper
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              padding: 1.5,
              zIndex: 100,
              boxShadow: 3,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="contained"
              size="medium"
              onClick={handleRecognizePath}
              color="primary"
              sx={{ fontWeight: "medium" }}
            >
              Recognize & Submit
            </Button>
          </Paper>
        )}

      {/* Recognition UI */}
      <RecognitionUI
        pendingRecognition={pendingRecognition}
        recognitionFailed={recognitionFailed}
        onSelectComponentType={handleSelectComponentType}
        onSubmitRecognition={handleSubmitRecognition}
        onCancelRecognition={handleCancelRecognition}
      />
    </Box>
  );
}
