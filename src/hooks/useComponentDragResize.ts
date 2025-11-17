import { useCallback, useState, useRef } from "react";
import type { Point } from "../utils/canvasUtils";
import type { CanvasComponent } from "../types/component";

interface UseComponentDragResizeProps {
  components: CanvasComponent[];
  onComponentsChange: (components: CanvasComponent[]) => void;
  selectedComponentIds: string[];
  snapToGrid: boolean;
  gridCellWidth: number;
  gridCellHeight: number;
  resizeMode: "relative" | "clone";
  snapToGridPoint: (point: Point) => Point;
}

export function useComponentDragResize({
  components,
  onComponentsChange,
  selectedComponentIds,
  snapToGrid,
  gridCellWidth,
  gridCellHeight,
  resizeMode,
  snapToGridPoint,
}: UseComponentDragResizeProps) {
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(
    null,
  );
  const [dragOffset, setDragOffset] = useState<Point | null>(null);
  const [resizingComponentId, setResizingComponentId] = useState<string | null>(
    null,
  );
  const [resizeStartX, setResizeStartX] = useState<number | null>(null);
  const [resizeStartY, setResizeStartY] = useState<number | null>(null);
  const [resizeStartWidth, setResizeStartWidth] = useState<number | null>(null);
  const [resizeStartHeight, setResizeStartHeight] = useState<number | null>(
    null,
  );
  const [resizeStartComponentX, setResizeStartComponentX] = useState<number | null>(null);
  const [resizeStartComponentY, setResizeStartComponentY] = useState<number | null>(null);
  const [resizeDirection, setResizeDirection] = useState<
    "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | null
  >(null);
  const [initialSelectedComponentStates, setInitialSelectedComponentStates] =
    useState<
      Map<string, { width: number; height: number; x: number; y: number }>
    >(new Map());
  const justFinishedResizeRef = useRef(false);

  const handleComponentMouseDown = useCallback(
    (
      e: React.MouseEvent,
      componentId: string,
      point: Point,
      isEraser: boolean,
      onSelectionChange: (ids: string[]) => void,
      resizeDirection?: string,
    ) => {
      e.stopPropagation();

      // Don't start dragging if clicking on interactive elements like Slider
      const target = e.target as HTMLElement;
      if (
        target.closest(".MuiSlider-root") ||
        target.closest(".MuiSlider-thumb") ||
        target.closest(".MuiSlider-track") ||
        target.closest(".MuiSlider-rail")
      ) {
        return;
      }

      // If eraser is active, remove the component
      if (isEraser) {
        onComponentsChange(components.filter((c) => c.id !== componentId));
        return;
      }

      const component = components.find((c) => c.id === componentId);
      if (!component) return;

      const componentWidth = component.width || 100; // Default width
      const componentHeight = component.height || 40; // Default height

      // Check if clicking on a resize handle
      if (resizeDirection && ["n", "s", "e", "w", "ne", "nw", "se", "sw"].includes(resizeDirection)) {
        setResizingComponentId(componentId);
        setResizeStartX(point.x);
        setResizeStartY(point.y);
        setResizeStartWidth(componentWidth);
        setResizeStartHeight(componentHeight);
        setResizeStartComponentX(component.x);
        setResizeStartComponentY(component.y);
        setResizeDirection(resizeDirection as "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw");
        // Store initial states of all selected components for multi-resize
        const initialStates = new Map<
          string,
          { width: number; height: number; x: number; y: number }
        >();
        selectedComponentIds.forEach((id) => {
          const comp = components.find((c) => c.id === id);
          if (comp) {
            initialStates.set(id, {
              width: comp.width || 100,
              height: comp.height || 40,
              x: comp.x,
              y: comp.y,
            });
          }
        });
        setInitialSelectedComponentStates(initialStates);
      } else {
        // Handle multi-selection with Ctrl or Shift
        const isCtrlClick = e.ctrlKey || e.metaKey;
        const isShiftClick = e.shiftKey;

        // Calculate final selection state before updating
        let finalSelectedIds: string[];
        if (isCtrlClick) {
          // Ctrl+Click: toggle individual component
          const isSelected = selectedComponentIds.includes(componentId);
          if (isSelected) {
            finalSelectedIds = selectedComponentIds.filter(
              (id) => id !== componentId,
            );
          } else {
            finalSelectedIds = [...selectedComponentIds, componentId];
          }
        } else if (isShiftClick) {
          // Shift+Click: select range from last selected to clicked
          if (selectedComponentIds.length === 0) {
            finalSelectedIds = [componentId];
          } else {
            const lastSelectedId =
              selectedComponentIds[selectedComponentIds.length - 1];
            const lastSelectedIndex = components.findIndex(
              (c) => c.id === lastSelectedId,
            );
            const clickedIndex = components.findIndex(
              (c) => c.id === componentId,
            );

            if (lastSelectedIndex === -1 || clickedIndex === -1) {
              finalSelectedIds = [...selectedComponentIds, componentId];
            } else {
              const startIndex = Math.min(lastSelectedIndex, clickedIndex);
              const endIndex = Math.max(lastSelectedIndex, clickedIndex);
              const rangeIds = components
                .slice(startIndex, endIndex + 1)
                .map((c) => c.id);

              // Merge with existing selection, avoiding duplicates
              finalSelectedIds = [
                ...new Set([...selectedComponentIds, ...rangeIds]),
              ];
            }
          }
        } else {
          // Regular click:
          // - If clicking on an already-selected component in a multi-selection, preserve the selection
          // - Otherwise, select only this component
          if (
            selectedComponentIds.length > 1 &&
            selectedComponentIds.includes(componentId)
          ) {
            // Keep existing multi-selection when clicking on already-selected component
            finalSelectedIds = selectedComponentIds;
          } else {
            // Select single component
            finalSelectedIds = [componentId];
          }
        }

        // Update selection state
        onSelectionChange(finalSelectedIds);

        // Only start dragging if the component will be selected
        const willBeSelected = finalSelectedIds.includes(componentId);

        if (willBeSelected) {
          // Store initial positions of all selected components for multi-drag
          // Use the final selection state (after toggle/range selection)
          const initialStates = new Map<
            string,
            { width: number; height: number; x: number; y: number }
          >();
          finalSelectedIds.forEach((id) => {
            const comp = components.find((c) => c.id === id);
            if (comp) {
              initialStates.set(id, {
                width: comp.width || 100,
                height: comp.height || 40,
                x: comp.x,
                y: comp.y,
              });
            }
          });
          setInitialSelectedComponentStates(initialStates);
          setDragOffset({
            x: point.x - component.x,
            y: point.y - component.y,
          });
          setDraggedComponentId(componentId);
        }
      }
    },
    [components, selectedComponentIds, onComponentsChange, snapToGridPoint],
  );

  const handleContainerMouseMove = useCallback(
    (point: Point) => {
      // Handle resizing
      if (resizingComponentId && resizeDirection && resizeStartX !== null && resizeStartY !== null && resizeStartWidth !== null && resizeStartHeight !== null && resizeStartComponentX !== null && resizeStartComponentY !== null) {
        const resizingComponent = components.find((c) => c.id === resizingComponentId);
        if (!resizingComponent) return;

        const deltaX = point.x - resizeStartX;
        const deltaY = point.y - resizeStartY;
        
        let newWidth = resizeStartWidth;
        let newHeight = resizeStartHeight;
        let newX = resizeStartComponentX;
        let newY = resizeStartComponentY;

        // Calculate new dimensions and position based on resize direction
        if (resizeDirection.includes("e")) {
          // Resize from right (east)
          newWidth = Math.max(50, resizeStartWidth + deltaX);
        }
        if (resizeDirection.includes("w")) {
          // Resize from left (west)
          newWidth = Math.max(50, resizeStartWidth - deltaX);
          newX = resizeStartComponentX + (resizeStartWidth - newWidth);
        }
        if (resizeDirection.includes("s")) {
          // Resize from bottom (south)
          newHeight = Math.max(30, resizeStartHeight + deltaY);
        }
        if (resizeDirection.includes("n")) {
          // Resize from top (north)
          newHeight = Math.max(30, resizeStartHeight - deltaY);
          newY = resizeStartComponentY + (resizeStartHeight - newHeight);
        }

        // Snap to grid
        let snappedWidth = newWidth;
        let snappedHeight = newHeight;
        let snappedX = newX;
        let snappedY = newY;
        
        if (snapToGrid) {
          // Ensure minimum size is at least one grid cell
          const minWidth = Math.max(gridCellWidth, newWidth);
          const minHeight = Math.max(gridCellHeight, newHeight);
          
          // Calculate number of grid cells, ensuring at least 1
          const numColumns = Math.max(1, Math.round(minWidth / gridCellWidth));
          snappedWidth = numColumns * gridCellWidth;
          const numRows = Math.max(1, Math.round(minHeight / gridCellHeight));
          snappedHeight = numRows * gridCellHeight;
          
          // Snap position to grid
          snappedX = Math.round(newX / gridCellWidth) * gridCellWidth;
          snappedY = Math.round(newY / gridCellHeight) * gridCellHeight;
        }

        // Calculate scale factors for relative mode
        const widthScaleFactor = snappedWidth / resizeStartWidth;
        const heightScaleFactor = snappedHeight / resizeStartHeight;

        // Apply resize to all selected components
        const updatedComponents = components.map((comp) => {
          if (selectedComponentIds.includes(comp.id)) {
            const initialState = initialSelectedComponentStates.get(comp.id);
            if (!initialState) return comp;

            if (resizeMode === "clone") {
              // In clone mode, all selected components match the resized component's dimensions
              return {
                ...comp,
                width: snappedWidth,
                height: snappedHeight,
                x: comp.id === resizingComponentId ? snappedX : comp.x,
                y: comp.id === resizingComponentId ? snappedY : comp.y,
              };
            } else {
              // Relative mode: calculate scale factor based on the resized component
              const newCompWidth = Math.max(50, initialState.width * widthScaleFactor);
              const newCompHeight = Math.max(30, initialState.height * heightScaleFactor);
              
              let snappedCompWidth = newCompWidth;
              let snappedCompHeight = newCompHeight;
              
              if (snapToGrid) {
                // Ensure minimum size is at least one grid cell
                const minCompWidth = Math.max(gridCellWidth, newCompWidth);
                const minCompHeight = Math.max(gridCellHeight, newCompHeight);
                
                // Calculate number of grid cells, ensuring at least 1
                const numColumns = Math.max(1, Math.round(minCompWidth / gridCellWidth));
                snappedCompWidth = numColumns * gridCellWidth;
                const numRows = Math.max(1, Math.round(minCompHeight / gridCellHeight));
                snappedCompHeight = numRows * gridCellHeight;
              }
              
              // Calculate position adjustments
              let newCompX = initialState.x;
              let newCompY = initialState.y;
              
              if (resizeDirection.includes("w")) {
                // When resizing from left, adjust x position
                newCompX = initialState.x + (initialState.width - snappedCompWidth);
              }
              if (resizeDirection.includes("n")) {
                // When resizing from top, adjust y position
                newCompY = initialState.y + (initialState.height - snappedCompHeight);
              }

              return {
                ...comp,
                width: snappedCompWidth,
                height: snappedCompHeight,
                x: snapToGrid ? Math.round(newCompX / gridCellWidth) * gridCellWidth : newCompX,
                y: snapToGrid ? Math.round(newCompY / gridCellHeight) * gridCellHeight : newCompY,
              };
            }
          }
          return comp;
        });
        onComponentsChange(updatedComponents);
        return;
      }

      // Handle dragging
      if (!draggedComponentId || !dragOffset) return;

      const draggedComponent = components.find(
        (c) => c.id === draggedComponentId,
      );
      if (!draggedComponent) return;

      const targetPoint = {
        x: point.x - dragOffset.x,
        y: point.y - dragOffset.y,
      };
      const snappedPoint = snapToGridPoint(targetPoint);

      // Calculate offset from initial position
      const draggedInitialState =
        initialSelectedComponentStates.get(draggedComponentId);
      if (!draggedInitialState) return;

      const deltaX = snappedPoint.x - draggedInitialState.x;
      const deltaY = snappedPoint.y - draggedInitialState.y;

      // Apply offset to all components that have initial states stored (i.e., all selected components)
      const updatedComponents = components.map((comp) => {
        const initialState = initialSelectedComponentStates.get(comp.id);
        if (initialState) {
          // This component was in the selection when drag started
          const newPoint = {
            x: initialState.x + deltaX,
            y: initialState.y + deltaY,
          };
          const snappedNewPoint = snapToGridPoint(newPoint);
          return {
            ...comp,
            x: snappedNewPoint.x,
            y: snappedNewPoint.y,
          };
        }
        return comp;
      });
      onComponentsChange(updatedComponents);
    },
    [
      resizingComponentId,
      resizeDirection,
      resizeStartX,
      resizeStartY,
      resizeStartWidth,
      resizeStartHeight,
      resizeStartComponentX,
      resizeStartComponentY,
      selectedComponentIds,
      initialSelectedComponentStates,
      resizeMode,
      snapToGrid,
      gridCellWidth,
      gridCellHeight,
      draggedComponentId,
      dragOffset,
      components,
      snapToGridPoint,
      onComponentsChange,
    ],
  );

  const handleContainerMouseUp = useCallback(() => {
    const wasResizing = resizingComponentId !== null;
    setDraggedComponentId(null);
    setDragOffset(null);
    setResizingComponentId(null);
    setResizeStartX(null);
    setResizeStartY(null);
    setResizeStartWidth(null);
    setResizeStartHeight(null);
    setResizeStartComponentX(null);
    setResizeStartComponentY(null);
    setResizeDirection(null);
    setInitialSelectedComponentStates(new Map());
    // Track that we just finished resizing to prevent deselection
    if (wasResizing) {
      justFinishedResizeRef.current = true;
      // Clear the flag after a short delay
      setTimeout(() => {
        justFinishedResizeRef.current = false;
      }, 100);
    }
  }, [resizingComponentId]);

  const checkJustFinishedResize = useCallback(() => {
    return justFinishedResizeRef.current;
  }, []);

  return {
    draggedComponentId,
    resizingComponentId,
    handleComponentMouseDown,
    handleContainerMouseMove,
    handleContainerMouseUp,
    checkJustFinishedResize,
  };
}
