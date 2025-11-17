import { Box, Button, Paper } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CanvasComponent, ComponentType } from "../types/component";
import ComponentRenderer from "./ComponentRenderer";
import RecognitionUI from "./RecognitionUI";
import GridOverlay from "./GridOverlay";
import BrushPreview from "./BrushPreview";
import SelectionBox from "./SelectionBox";
import {
  getPointFromEvent,
  snapToGridPoint,
  type Point,
} from "../utils/canvasUtils";
import { useCanvasDrawing } from "../hooks/useCanvasDrawing";
import { useSelectionBox } from "../hooks/useSelectionBox";
import { useComponentDragResize } from "../hooks/useComponentDragResize";
import { useThinkingPen } from "../hooks/useThinkingPen";

interface CanvasProps {
  width?: number;
  height?: number;
  penColor?: string;
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
  penColor = "#000000",
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
  const [actualWidth, setActualWidth] = useState(width);
  const [actualHeight, setActualHeight] = useState(height);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>(
    [],
  );
  const [brushPosition, setBrushPosition] = useState<Point | null>(null);
  const brushAnimationFrameRef = useRef<number | null>(null);

  // Grid configuration: 12 columns, rows calculated to fit canvas
  const gridColumns = 12;

  // Calculate grid dimensions with useMemo to ensure consistency
  const { gridCellWidth, gridCellHeight } = useMemo(() => {
    const cellWidth = Math.floor(actualWidth / gridColumns);
    const rows = Math.max(1, Math.floor(actualHeight / 40));
    const cellHeight = Math.floor(actualHeight / rows);
    return {
      gridCellWidth: cellWidth,
      gridCellHeight: cellHeight,
    };
  }, [actualWidth, actualHeight]);

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

  // Measure container size and update canvas dimensions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setActualWidth(rect.width);
      setActualHeight(rect.height);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    window.addEventListener("resize", updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // Initialize canvas and preserve content on resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    const isInitialSetup = oldWidth === 0 && oldHeight === 0;

    let imageData: ImageData | null = null;
    if (!isInitialSetup && oldWidth > 0 && oldHeight > 0) {
      imageData = ctx.getImageData(0, 0, oldWidth, oldHeight);
    }

    canvas.width = actualWidth;
    canvas.height = actualHeight;

    if (imageData) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = oldWidth;
      tempCanvas.height = oldHeight;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.putImageData(imageData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
      }
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, actualWidth, actualHeight);
    }
  }, [actualWidth, actualHeight]);

  // Restore canvas image data when provided (for undo/redo)
  const previousRestoreDataRef = useRef<string | null>(null);
  const isRestoringRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !restoreCanvasImageData) {
      previousRestoreDataRef.current = null;
      return;
    }

    if (restoreCanvasImageData === previousRestoreDataRef.current) return;
    previousRestoreDataRef.current = restoreCanvasImageData;

    if (actualWidth === 0 || actualHeight === 0) {
      return;
    }

    isRestoringRef.current = true;
    const timeoutId = setTimeout(() => {
      const canvasElement = canvasRef.current;
      if (!canvasElement) {
        isRestoringRef.current = false;
        return;
      }

      const ctx = canvasElement.getContext("2d");
      if (!ctx) {
        isRestoringRef.current = false;
        return;
      }

      if (
        canvasElement.width !== actualWidth ||
        canvasElement.height !== actualHeight
      ) {
        isRestoringRef.current = false;
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) {
          isRestoringRef.current = false;
          return;
        }
        const canvasEl = canvasRef.current;
        const ctx2 = canvasEl.getContext("2d");
        if (!ctx2) {
          isRestoringRef.current = false;
          return;
        }
        ctx2.clearRect(0, 0, canvasEl.width, canvasEl.height);
        ctx2.drawImage(img, 0, 0);
        isRestoringRef.current = false;
      };
      img.onerror = () => {
        isRestoringRef.current = false;
      };
      img.src = restoreCanvasImageData;
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [restoreCanvasImageData, actualWidth, actualHeight]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (brushAnimationFrameRef.current !== null) {
        cancelAnimationFrame(brushAnimationFrameRef.current);
      }
    };
  }, []);

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

  // Track mouse position for brush preview with throttling
  const handleCanvasMouseMoveForBrush = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if ((isDrawing || isEraser || isThinkingPen) && !selectedComponentType) {
        const point = getPointFromEventFn(e);
        if (brushAnimationFrameRef.current !== null) {
          cancelAnimationFrame(brushAnimationFrameRef.current);
        }
        brushAnimationFrameRef.current = requestAnimationFrame(() => {
          setBrushPosition(point);
          brushAnimationFrameRef.current = null;
        });
      }
    },
    [
      isDrawing,
      isEraser,
      isThinkingPen,
      selectedComponentType,
      getPointFromEventFn,
    ],
  );

  const handleCanvasMouseLeave = useCallback(() => {
    if (brushAnimationFrameRef.current !== null) {
      cancelAnimationFrame(brushAnimationFrameRef.current);
      brushAnimationFrameRef.current = null;
    }
    setBrushPosition(null);
  }, []);

  // Component placement handlers
  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && selectedComponentType) {
        const point = getPointFromEventFn(e);
        const snappedPoint = snapToGridPointFn(point);
        const newComponent: CanvasComponent = {
          id: `component-${Date.now()}`,
          type: selectedComponentType,
          x: snappedPoint.x,
          y: snappedPoint.y,
          width: gridCellWidth,
          height: gridCellHeight,
          props: {},
        };
        onComponentsChange([...components, newComponent]);
        onComponentPlaced();
      }
    },
    [
      selectedComponentType,
      getPointFromEventFn,
      snapToGridPointFn,
      gridCellWidth,
      components,
      onComponentsChange,
      onComponentPlaced,
    ],
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
          const snappedPoint = snapToGridPointFn(point);
          const newComponent: CanvasComponent = {
            id: `component-${Date.now()}`,
            type: selectedComponentType,
            x: snappedPoint.x,
            y: snappedPoint.y,
            width: gridCellWidth,
            height: gridCellHeight,
            props: {},
          };
          onComponentsChange([...components, newComponent]);
          onComponentPlaced();
        }
      }
    },
    [
      checkJustFinishedSelectionBox,
      isCursorMode,
      selectedComponentType,
      getPointFromEventFn,
      snapToGridPointFn,
      gridCellWidth,
      components,
      onComponentsChange,
      onComponentPlaced,
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
  const handleContainerMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isCursorMode && e.target === e.currentTarget) {
        const point = getPointFromEventFn(e);
        startSelectionBox(point);
      }
    },
    [isCursorMode, getPointFromEventFn, startSelectionBox],
  );

  const handleContainerMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const point = getPointFromEventFn(e);

      // Update selection box
      updateSelectionBox(point, draggedComponentId, resizingComponentId);

      // Handle drag/resize
      handleContainerMouseMoveBase(point);
    },
    [
      getPointFromEventFn,
      updateSelectionBox,
      draggedComponentId,
      resizingComponentId,
      handleContainerMouseMoveBase,
    ],
  );

  const handleContainerMouseUp = useCallback(() => {
    finishSelectionBox();
    handleContainerMouseUpBase();
  }, [finishSelectionBox, handleContainerMouseUpBase]);

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
      const newComponent: CanvasComponent = {
        id: `component-${Date.now()}`,
        type: componentType,
        x: snappedPoint.x,
        y: snappedPoint.y,
        width: gridCellWidth,
        height: gridCellHeight,
        props: {},
      };
      onComponentsChange([...components, newComponent]);
      onComponentPlaced();
    },
    [
      getPointFromEventFn,
      snapToGridPointFn,
      gridCellWidth,
      components,
      onComponentsChange,
      onComponentPlaced,
    ],
  );

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Ctrl+A / Cmd+A to select all components
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (components.length > 0) {
          setSelectedComponentIds(components.map((c) => c.id));
        }
        return;
      }

      // Handle Enter key for shape recognition/submission
      if (e.key === "Enter") {
        if (pendingRecognition) {
          e.preventDefault();
          handleSubmitRecognition();
          return;
        }
        if (isThinkingPen && hasDrawing) {
          e.preventDefault();
          handleRecognizePath();
          return;
        }
      }

      // Handle Escape key to cancel recognition or deselect components
      if (e.key === "Escape") {
        e.preventDefault();
        if (
          pendingRecognition ||
          recognitionFailed ||
          (isThinkingPen && hasDrawing)
        ) {
          handleCancelRecognition();
          return;
        }
        if (selectedComponentIds.length > 0) {
          setSelectedComponentIds([]);
          return;
        }
      }

      // Handle Delete/Backspace
      if (
        selectedComponentIds.length > 0 &&
        (e.key === "Backspace" || e.key === "Delete")
      ) {
        e.preventDefault();
        onComponentsChange(
          components.filter((c) => !selectedComponentIds.includes(c.id)),
        );
        setSelectedComponentIds([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [
    selectedComponentIds,
    components,
    onComponentsChange,
    isThinkingPen,
    pendingRecognition,
    recognitionFailed,
    hasDrawing,
    handleRecognizePath,
    handleSubmitRecognition,
    handleCancelRecognition,
  ]);

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
      onMouseDown={handleContainerMouseDown}
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
          handleCanvasMouseMoveForBrush(e);
        }}
        onMouseUp={handleCanvasMouseUpBase}
        onMouseLeave={handleCanvasMouseLeave}
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

      <SelectionBox start={selectionBoxStart} end={selectionBoxEnd} />

      {/* Component overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents:
            (!isDrawing && !isEraser && !isThinkingPen) || selectedComponentType
              ? "auto"
              : "none",
          zIndex: 2,
          cursor,
        }}
        onMouseDown={(e) => {
          if (isCursorMode && e.target === e.currentTarget) {
            const point = getPointFromEventFn(e);
            startSelectionBox(point);
          }
        }}
        onMouseMove={(e) => {
          if (
            isCursorMode &&
            selectionBoxStart &&
            !draggedComponentId &&
            !resizingComponentId
          ) {
            const point = getPointFromEventFn(e);
            updateSelectionBox(point, draggedComponentId, resizingComponentId);
          }
          if (
            (isDrawing || isEraser || isThinkingPen) &&
            !selectedComponentType
          ) {
            const point = getPointFromEventFn(e);
            if (brushAnimationFrameRef.current !== null) {
              cancelAnimationFrame(brushAnimationFrameRef.current);
            }
            brushAnimationFrameRef.current = requestAnimationFrame(() => {
              setBrushPosition(point);
              brushAnimationFrameRef.current = null;
            });
          }
        }}
        onMouseUp={() => {
          finishSelectionBox();
        }}
        onClick={handleOverlayClick}
        onMouseLeave={() => {
          if (brushAnimationFrameRef.current !== null) {
            cancelAnimationFrame(brushAnimationFrameRef.current);
            brushAnimationFrameRef.current = null;
          }
          setBrushPosition(null);
          clearSelectionBox();
        }}
      >
        {components.map((component) => (
          <ComponentRenderer
            key={component.id}
            component={component}
            onMouseDown={handleComponentMouseDown}
            isDragging={draggedComponentId === component.id}
            isSelected={selectedComponentIds.includes(component.id)}
          />
        ))}
      </Box>

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
