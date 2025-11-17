import { Box, Button, Menu, MenuItem, Paper, Snackbar } from "@mui/material";
import { ContentPaste as PasteIcon, SelectAll as SelectAllIcon } from "@mui/icons-material";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CanvasComponent, ComponentType } from "../types/component";
import RecognitionUI from "./RecognitionUI";
import GridOverlay from "./GridOverlay";
import BrushPreview from "./BrushPreview";
import SelectionBox from "./SelectionBox";
import ComponentOverlay from "./ComponentOverlay";
import LassoPath from "./LassoPath";
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

const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x <
        ((xj - xi) * (point.y - yi)) / (yj - yi + Number.EPSILON) + xi;

    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
};

interface CanvasProps {
  width?: number;
  height?: number;
  penColor?: string;
  componentColor?: string;
  componentColorTimestamp?: number;
  penSize?: number;
  isDrawing?: boolean;
  isEraser?: boolean;
  isMagicWand?: boolean;
  isLasso?: boolean;
  components: CanvasComponent[];
  onComponentsChange: (components: CanvasComponent[]) => void;
  selectedComponentType: ComponentType | null;
  onComponentPlaced: () => void;
  snapToGrid?: boolean;
  resizeMode?: "relative" | "match";
  onCanvasStateChange?: (imageData: string | null) => void;
  restoreCanvasImageData?: string | null;
  showTitleBar?: boolean;
  showUrlBar?: boolean;
  showBookmarkBar?: boolean;
  isBrowserUIEnabled?: boolean;
  isMacOSStyle?: boolean;
  canvasColor?: string;
  isTextSelectMode?: boolean;
  onResetTools?: () => void;
}

export default function Canvas({
  width = 800,
  height = 600,
  penColor = "#1976d2",
  componentColor = "#1976d2",
  componentColorTimestamp = 0,
  penSize = 2,
  isDrawing = true,
  isEraser = false,
  isMagicWand = false,
  isLasso = false,
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
  isTextSelectMode = false,
  onResetTools,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>(
    [],
  );
  const [copiedComponents, setCopiedComponents] = useState<CanvasComponent[]>(
    [],
  );
  const [lassoPath, setLassoPath] = useState<Point[]>([]);
  const lassoPathRef = useRef<Point[]>([]);
  const [isLassoDrawing, setIsLassoDrawing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [contextMenuAnchor, setContextMenuAnchor] = useState<{ mouseX: number; mouseY: number } | null>(null);

  const resetLasso = useCallback(() => {
    setIsLassoDrawing(false);
    lassoPathRef.current = [];
    setLassoPath([]);
  }, []);

  useEffect(() => {
    if (!isLasso) {
      resetLasso();
    }
  }, [isLasso, resetLasso]);

  // Update selected components' colors when componentColor changes or when timestamp changes
  // The timestamp allows us to force updates even when the same color is selected
  const lastAppliedTimestampRef = useRef<number>(componentColorTimestamp);
  
  useEffect(() => {
    if (selectedComponentIds.length > 0 && componentColorTimestamp > lastAppliedTimestampRef.current) {
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
      lastAppliedTimestampRef.current = componentColorTimestamp;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentColor, componentColorTimestamp]); // Run when componentColor or timestamp changes

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
    isLasso,
    isTextMode: isTextSelectMode,
    selectedComponentType,
    components,
    onSelectionChange: setSelectedComponentIds,
  });

  const handleLassoStart = useCallback(
    (point: Point) => {
      if (!isLasso) return;
      setIsLassoDrawing(true);
      lassoPathRef.current = [point];
      setLassoPath([point]);
      setSelectedComponentIds([]);
    },
    [isLasso],
  );

  const handleLassoUpdate = useCallback(
    (point: Point) => {
      if (!isLassoDrawing) return;
      lassoPathRef.current = [...lassoPathRef.current, point];
      setLassoPath((prev) => [...prev, point]);
    },
    [isLassoDrawing],
  );

  const handleLassoFinish = useCallback(() => {
    if (!isLassoDrawing) return;
    const path = lassoPathRef.current;
    if (!path || path.length < 3) {
      resetLasso();
      return;
    }

    const selected = components.filter((comp) => {
      const width = comp.width || 100;
      const height = comp.height || 40;
      const corners: Point[] = [
        { x: comp.x, y: comp.y },
        { x: comp.x + width, y: comp.y },
        { x: comp.x + width, y: comp.y + height },
        { x: comp.x, y: comp.y + height },
      ];
      const center = {
        x: comp.x + width / 2,
        y: comp.y + height / 2,
      };

      const anyCornerInside = corners.some((corner) =>
        isPointInPolygon(corner, path),
      );
      if (anyCornerInside) {
        return true;
      }

      // Check center as fallback
      if (isPointInPolygon(center, path)) {
        return true;
      }

      // Check if lasso edge intersects component edges
      const lassoEdges = path.map((point, index) => [
        point,
        path[(index + 1) % path.length],
      ]);
      const rectEdges = [
        [corners[0], corners[1]],
        [corners[1], corners[2]],
        [corners[2], corners[3]],
        [corners[3], corners[0]],
      ] as [Point, Point][];

      const edgesIntersect = rectEdges.some(([rStart, rEnd]) =>
        lassoEdges.some(([lStart, lEnd]) => {
          const denominator =
            (lEnd.y - lStart.y) * (rEnd.x - rStart.x) -
            (lEnd.x - lStart.x) * (rEnd.y - rStart.y);
          if (denominator === 0) {
            return false;
          }
          const uA =
            ((lEnd.x - lStart.x) * (rStart.y - lStart.y) -
              (lEnd.y - lStart.y) * (rStart.x - lStart.x)) /
            denominator;
          const uB =
            ((rEnd.x - rStart.x) * (rStart.y - lStart.y) -
              (rEnd.y - rStart.y) * (rStart.x - lStart.x)) /
            denominator;
          return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
        }),
      );

      return edgesIntersect;
    });

    setSelectedComponentIds(selected.map((c) => c.id));
    resetLasso();
  }, [isLassoDrawing, components, resetLasso]);

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
    canvasWidth: actualWidth,
    canvasHeight: actualHeight,
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

  // Global mouse move listener to continue updating selection box when mouse leaves canvas
  useEffect(() => {
    if (selectionBoxStart === null || draggedComponentId !== null || resizingComponentId !== null) {
      return;
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (selectionBoxStart === null || draggedComponentId !== null || resizingComponentId !== null) {
        return;
      }

      // Convert global mouse position to canvas coordinates
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      // Clamp to canvas boundaries
      x = Math.max(0, Math.min(x, actualWidth));
      y = Math.max(0, Math.min(y, actualHeight));

      // Update selection box with clamped point
      updateSelectionBox({ x, y }, draggedComponentId, resizingComponentId);
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [selectionBoxStart, draggedComponentId, resizingComponentId, actualWidth, actualHeight, updateSelectionBox]);

  // Global mouse move listener to continue updating lasso when mouse leaves canvas
  useEffect(() => {
    if (!isLassoDrawing || draggedComponentId !== null || resizingComponentId !== null) {
      return;
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isLassoDrawing || draggedComponentId !== null || resizingComponentId !== null) {
        return;
      }

      // Convert global mouse position to canvas coordinates
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      // Clamp to canvas boundaries
      x = Math.max(0, Math.min(x, actualWidth));
      y = Math.max(0, Math.min(y, actualHeight));

      // Update lasso with clamped point
      handleLassoUpdate({ x, y });
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isLassoDrawing, draggedComponentId, resizingComponentId, actualWidth, actualHeight, handleLassoUpdate]);

  // Global mouse up listener to finish selection box and lasso if mouse released outside canvas
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (selectionBoxStart !== null) {
        finishSelectionBox();
      }
      if (isLassoDrawing) {
        handleLassoFinish();
      }
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [selectionBoxStart, finishSelectionBox, isLassoDrawing, handleLassoFinish]);

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
      if (!isLasso) {
        handleCanvasMouseDownBase(point);
      }
      if (isMagicWand) {
        addPathPoint(point);
      }
    },
    [
      getPointFromEventFn,
      handleCanvasMouseDownBase,
      isMagicWand,
      addPathPoint,
      isLasso,
    ],
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getPointFromEventFn(e);
      if (!isLasso) {
        handleCanvasMouseMoveBase(
          point,
          isMagicWand ? addPathPoint : undefined,
        );
      }
    },
    [
      getPointFromEventFn,
      handleCanvasMouseMoveBase,
      isMagicWand,
      addPathPoint,
      isLasso,
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
      if (isTextSelectMode) {
        return;
      }
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
    [getPointFromEventFn, handleComponentMouseDownBase, isEraser, isTextSelectMode],
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
      setToastMessage(`${selectedComps.length} component${selectedComps.length === 1 ? '' : 's'} copied to clipboard`);
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
      setToastMessage(`${newComponents.length} component${newComponents.length === 1 ? '' : 's'} pasted`);
    },
    onRecognizePath: handleRecognizePath,
    onSubmitRecognition: handleSubmitRecognition,
    onCancelRecognition: handleCancelRecognition,
  });

  // Hide default cursor when showing brush preview
  const cursor = isTextSelectMode
    ? "text"
    : (isDrawing || isEraser || isMagicWand) && !selectedComponentType
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
      onContextMenu={(e) => {
        // Only show context menu if right-clicking on empty space (not on components)
        // Browser UI will naturally intercept clicks due to higher z-index and pointerEvents
        if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === "CANVAS") {
          e.preventDefault();
          setContextMenuAnchor({
            mouseX: e.clientX,
            mouseY: e.clientY,
          });
        }
      }}
      onMouseMove={handleContainerMouseMove}
      onMouseUp={(e) => {
        // Prevent default middle mouse button behavior (auto-scroll)
        if (e.button === 1) {
          e.preventDefault();
        }
        handleContainerMouseUp();
      }}
      onMouseDown={(e) => {
        // Middle mouse button (button === 1) to reset tools
        if (e.button === 1 && onResetTools) {
          e.preventDefault();
          onResetTools();
        }
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={(e) => {
          // Middle mouse button (button === 1) to reset tools
          if (e.button === 1 && onResetTools) {
            e.preventDefault();
            onResetTools();
            return;
          }
          handleCanvasMouseDown(e);
        }}
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
      <LassoPath path={lassoPath} isActive={isLassoDrawing} />

      <ComponentOverlay
        components={components}
        isCursorMode={isCursorMode}
        isLassoMode={isLasso}
        selectionBoxStart={selectionBoxStart}
        draggedComponentId={draggedComponentId}
        resizingComponentId={resizingComponentId}
        isDrawing={isDrawing}
        isEraser={isEraser}
        isMagicWand={isMagicWand}
        isLassoDrawing={isLassoDrawing}
        selectedComponentType={selectedComponentType}
        cursor={cursor}
        selectedComponentIds={selectedComponentIds}
        getPointFromEvent={getPointFromEventFn}
        isTextSelectMode={isTextSelectMode}
        onSelectionBoxStart={startSelectionBox}
        onSelectionBoxUpdate={(point) =>
          updateSelectionBox(point, draggedComponentId, resizingComponentId)
        }
        onSelectionBoxFinish={finishSelectionBox}
        onSelectionBoxClear={clearSelectionBox}
        onBrushMouseMove={handleBrushMouseMove}
        onBrushMouseLeave={handleBrushMouseLeave}
        onLassoStart={handleLassoStart}
        onLassoUpdate={handleLassoUpdate}
        onLassoFinish={handleLassoFinish}
        onComponentMouseDown={handleComponentMouseDown}
        onComponentUpdate={(componentId, props) => {
          onComponentsChange(
            components.map((c) =>
              c.id === componentId ? { ...c, props: { ...c.props, ...props } } : c
            )
          );
        }}
        onComponentColorChange={(componentId, color) => {
          onComponentsChange(
            components.map((c) =>
              c.id === componentId ? { ...c, color } : c
            )
          );
        }}
        onComponentDelete={(componentId) => {
          onComponentsChange(
            components.filter((c) => c.id !== componentId)
          );
        }}
        onComponentCopy={(component) => {
          // Store component in clipboard instead of immediately pasting
          setCopiedComponents([component]);
          setToastMessage("1 component copied to clipboard");
        }}
        onOverlayClick={handleOverlayClick}
        onContextMenu={(e) => {
          // Only show context menu if right-clicking on empty space (not on components)
          // Browser UI will naturally intercept clicks due to higher z-index and pointerEvents
          e.preventDefault();
          setContextMenuAnchor({
            mouseX: e.clientX,
            mouseY: e.clientY,
          });
        }}
        onResetTools={onResetTools}
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

      {/* Toast notification */}
      <Snackbar
        open={toastMessage !== null}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      {/* Context menu for empty space */}
      <Menu
        open={contextMenuAnchor !== null}
        onClose={() => setContextMenuAnchor(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenuAnchor !== null
            ? { top: contextMenuAnchor.mouseY, left: contextMenuAnchor.mouseX }
            : undefined
        }
      >
        <MenuItem
          disabled={copiedComponents.length === 0}
          onClick={() => {
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
            setToastMessage(`${newComponents.length} component${newComponents.length === 1 ? '' : 's'} pasted`);
            setContextMenuAnchor(null);
          }}
        >
          <PasteIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
          Paste
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (components.length > 0) {
              setSelectedComponentIds(components.map((c) => c.id));
            }
            setContextMenuAnchor(null);
          }}
        >
          <SelectAllIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
          Select All
        </MenuItem>
      </Menu>
    </Box>
  );
}
