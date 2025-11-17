import { Box, Button, Paper } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CanvasComponent, ComponentType } from "../types/component";
import RecognitionUI from "./RecognitionUI";
import GridOverlay from "./GridOverlay";
import BrushPreview from "./BrushPreview";
import SelectionBox from "./SelectionBox";
import ComponentOverlay from "./ComponentOverlay";
import BrowserUI from "./BrowserUI";
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
import { useMagicWand } from "../hooks/useMagicWand";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

interface CanvasProps {
  width?: number;
  height?: number;
  penColor?: string;
  componentColor?: string;
  penSize?: number;
  isDrawing?: boolean;
  isEraser?: boolean;
  isMagicWand?: boolean;
  components: CanvasComponent[];
  onComponentsChange: (components: CanvasComponent[]) => void;
  selectedComponentType: ComponentType | null;
  onComponentPlaced: () => void;
  snapToGrid?: boolean;
  resizeMode?: "relative" | "clone";
  onCanvasStateChange?: (imageData: string | null) => void;
  restoreCanvasImageData?: string | null;
  showTitleBar?: boolean;
  showUrlBar?: boolean;
  showBookmarkBar?: boolean;
  isBrowserUIEnabled?: boolean;
  isMacOSStyle?: boolean;
  canvasColor?: string;
}

export default function Canvas({
  width = 800,
  height = 600,
  penColor = "#1976d2",
  componentColor = "#1976d2",
  penSize = 2,
  isDrawing = true,
  isEraser = false,
  isMagicWand = false,
  components,
  onComponentsChange,
  selectedComponentType,
  onComponentPlaced,
  snapToGrid = false,
  resizeMode = "relative",
  onCanvasStateChange,
  restoreCanvasImageData,
  showTitleBar = false,
  showUrlBar = false,
  showBookmarkBar = false,
  isBrowserUIEnabled = false,
  isMacOSStyle = false,
  canvasColor = "#ffffff",
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>(
    [],
  );
  const [copiedComponents, setCopiedComponents] = useState<CanvasComponent[]>(
    [],
  );

  // Update selected components' colors when componentColor changes
  useEffect(() => {
    if (selectedComponentIds.length > 0) {
      const updatedComponents = components.map((comp) => {
        if (selectedComponentIds.includes(comp.id)) {
          return {
            ...comp,
            color: componentColor,
          };
        }
        return comp;
      });
      onComponentsChange(updatedComponents);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentColor]); // Only run when componentColor changes

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
    isMagicWand,
    selectedComponentType,
    onCanvasStateChange,
  });

  // Magic wand hook
  const {
    hasDrawing,
    pendingRecognition,
    recognitionFailed,
    addPathPoint,
    handleRecognizePath,
    handleSubmitRecognition,
    handleSelectComponentType,
    handleCancelRecognition,
  } = useMagicWand({
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
    getPreviewSelection,
  } = useSelectionBox({
    isDrawing,
    isEraser,
    isMagicWand,
    selectedComponentType,
    components,
    onSelectionChange: setSelectedComponentIds,
  });

  // Update selection in real-time during drag
  useEffect(() => {
    if (!selectionBoxStart) {
      return;
    }

    let animationFrameId: number;
    const updateSelection = () => {
      const preview = getPreviewSelection();
      // Update selection in real-time during drag
      if (preview.length > 0 || selectionBoxStart) {
        setSelectedComponentIds(preview);
      }
      animationFrameId = requestAnimationFrame(updateSelection);
    };
    
    animationFrameId = requestAnimationFrame(updateSelection);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [selectionBoxStart, getPreviewSelection]);

  // Component drag/resize hook
  const {
    draggedComponentId,
    resizingComponentId,
    handleComponentMouseDown: handleComponentMouseDownBase,
    handleContainerMouseMove: handleContainerMouseMoveBase,
    handleContainerMouseUp: handleContainerMouseUpBase,
    checkJustFinishedResize,
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
    isMagicWand,
    selectedComponentType,
    getPointFromEvent: getPointFromEventFn,
  });

  // Clear pending recognition when magic wand is disabled
  useEffect(() => {
    if (
      !isMagicWand &&
      (pendingRecognition || recognitionFailed || hasDrawing)
    ) {
      handleCancelRecognition();
    }
  }, [
    isMagicWand,
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
      if (isMagicWand) {
        addPathPoint(point);
      }
    },
    [
      getPointFromEventFn,
      handleCanvasMouseDownBase,
      isMagicWand,
      addPathPoint,
    ],
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getPointFromEventFn(e);
      handleCanvasMouseMoveBase(
        point,
        isMagicWand ? addPathPoint : undefined,
      );
    },
    [
      getPointFromEventFn,
      handleCanvasMouseMoveBase,
      isMagicWand,
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
        // Don't deselect if we just finished resizing
        if (checkJustFinishedResize()) {
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
      checkJustFinishedResize,
      isCursorMode,
      selectedComponentType,
      getPointFromEventFn,
      placeComponent,
    ],
  );

  // Component mouse down handler
  const handleComponentMouseDown = useCallback(
    (e: React.MouseEvent, componentId: string, resizeDirection?: string) => {
      const point = getPointFromEventFn(e);
      handleComponentMouseDownBase(
        e,
        componentId,
        point,
        isEraser,
        setSelectedComponentIds,
        resizeDirection,
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
    isMagicWand,
    pendingRecognition,
    recognitionFailed,
    hasDrawing,
    gridCellWidth,
    gridCellHeight,
    snapToGrid,
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
    onMoveSelected: (deltaX, deltaY) => {
      if (selectedComponentIds.length === 0) return;
      
      const updatedComponents = components.map((comp) => {
        if (selectedComponentIds.includes(comp.id)) {
          let newX = comp.x + deltaX;
          let newY = comp.y + deltaY;
          
          // Snap to grid if enabled
          if (snapToGrid) {
            newX = Math.round(newX / gridCellWidth) * gridCellWidth;
            newY = Math.round(newY / gridCellHeight) * gridCellHeight;
          }
          
          // Get component dimensions
          const compWidth = comp.width || 100;
          const compHeight = comp.height || 40;
          
          // Clamp to canvas boundaries
          newX = Math.max(0, Math.min(newX, actualWidth - compWidth));
          newY = Math.max(0, Math.min(newY, actualHeight - compHeight));
          
          return {
            ...comp,
            x: newX,
            y: newY,
          };
        }
        return comp;
      });
      
      onComponentsChange(updatedComponents);
    },
    onCopySelected: () => {
      if (selectedComponentIds.length === 0) return;
      const selectedComps = components.filter((c) =>
        selectedComponentIds.includes(c.id),
      );
      setCopiedComponents(selectedComps);
    },
    onPaste: () => {
      if (copiedComponents.length === 0) return;
      
      // Create new components with offset positions and new IDs
      const offsetX = snapToGrid ? gridCellWidth : 10;
      const offsetY = snapToGrid ? gridCellHeight : 10;
      
      const newComponents = copiedComponents.map((comp, index) => {
        let newX = comp.x + offsetX;
        let newY = comp.y + offsetY;
        
        if (snapToGrid) {
          newX = Math.round(newX / gridCellWidth) * gridCellWidth;
          newY = Math.round(newY / gridCellHeight) * gridCellHeight;
        }
        
        return {
          ...comp,
          id: `component-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
          x: newX,
          y: newY,
        };
      });
      
      const newComponentIds = newComponents.map((c) => c.id);
      onComponentsChange([...components, ...newComponents]);
      setSelectedComponentIds(newComponentIds);
    },
    onRecognizePath: handleRecognizePath,
    onSubmitRecognition: handleSubmitRecognition,
    onCancelRecognition: handleCancelRecognition,
  });

  // Hide default cursor when showing brush preview
  const cursor =
    (isDrawing || isEraser || isMagicWand) && !selectedComponentType
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
        backgroundColor: canvasColor,
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
            (isDrawing || isEraser || isMagicWand) && !selectedComponentType
              ? "auto"
              : "none",
          cursor,
        }}
      />

      {isBrowserUIEnabled && (
        <BrowserUI
          showTitleBar={showTitleBar}
          showUrlBar={showUrlBar}
          showBookmarkBar={showBookmarkBar}
          isMacOSStyle={isMacOSStyle}
        />
      )}

      <GridOverlay
        snapToGrid={snapToGrid}
        gridCellWidth={gridCellWidth}
        gridCellHeight={gridCellHeight}
      />

      <BrushPreview
        isDrawing={isDrawing}
        isEraser={isEraser}
        isMagicWand={isMagicWand}
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
        isMagicWand={isMagicWand}
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
        onComponentUpdate={(componentId, props) => {
          onComponentsChange(
            components.map((c) =>
              c.id === componentId ? { ...c, props: { ...c.props, ...props } } : c
            )
          );
        }}
        onOverlayClick={handleOverlayClick}
      />

      {/* Submit button for magic wand - shown when drawing */}
      {isMagicWand &&
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
