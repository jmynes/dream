import { useCallback, useState } from "react";
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
	const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null);
	const [dragOffset, setDragOffset] = useState<Point | null>(null);
	const [resizingComponentId, setResizingComponentId] = useState<string | null>(null);
	const [resizeStartX, setResizeStartX] = useState<number | null>(null);
	const [resizeStartWidth, setResizeStartWidth] = useState<number | null>(null);
	const [resizeStartY, setResizeStartY] = useState<number | null>(null);
	const [resizeStartHeight, setResizeStartHeight] = useState<number | null>(null);
	const [resizeDirection, setResizeDirection] = useState<"width" | "height" | null>(null);
	const [initialSelectedComponentStates, setInitialSelectedComponentStates] = useState<
		Map<string, { width: number; height: number; x: number; y: number }>
	>(new Map());

	const handleComponentMouseDown = useCallback(
		(
			e: React.MouseEvent,
			componentId: string,
			point: Point,
			isEraser: boolean,
			onSelectionChange: (ids: string[]) => void,
		) => {
			e.stopPropagation();

			// If eraser is active, remove the component
			if (isEraser) {
				onComponentsChange(components.filter((c) => c.id !== componentId));
				return;
			}

			const component = components.find((c) => c.id === componentId);
			if (!component) return;

			// Check if clicking on resize handle (right edge or bottom edge)
			const componentWidth = component.width || 100; // Default width
			const componentHeight = component.height || 40; // Default height
			const handleRightEdge = component.x + componentWidth;
			const handleBottomEdge = component.y + componentHeight;
			// Resize handle is 16px wide/tall, positioned at edge-8, so extends from edge-8 to edge+8
			const isWidthResizeHandle =
				point.x >= handleRightEdge - 8 &&
				point.x <= handleRightEdge + 8 &&
				point.y >= component.y &&
				point.y <= component.y + componentHeight;
			const isHeightResizeHandle =
				point.y >= handleBottomEdge - 8 &&
				point.y <= handleBottomEdge + 8 &&
				point.x >= component.x &&
				point.x <= component.x + componentWidth;

			if (isWidthResizeHandle) {
				setResizingComponentId(componentId);
				setResizeStartX(point.x);
				setResizeStartWidth(componentWidth);
				setResizeDirection("width");
				// Store initial states of all selected components for multi-resize
				const initialStates = new Map<string, { width: number; height: number; x: number; y: number }>();
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
			} else if (isHeightResizeHandle) {
				setResizingComponentId(componentId);
				setResizeStartY(point.y);
				setResizeStartHeight(componentHeight);
				setResizeDirection("height");
				// Store initial states of all selected components for multi-resize
				const initialStates = new Map<string, { width: number; height: number; x: number; y: number }>();
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
						finalSelectedIds = selectedComponentIds.filter((id) => id !== componentId);
					} else {
						finalSelectedIds = [...selectedComponentIds, componentId];
					}
				} else if (isShiftClick) {
					// Shift+Click: select range from last selected to clicked
					if (selectedComponentIds.length === 0) {
						finalSelectedIds = [componentId];
					} else {
						const lastSelectedId = selectedComponentIds[selectedComponentIds.length - 1];
						const lastSelectedIndex = components.findIndex((c) => c.id === lastSelectedId);
						const clickedIndex = components.findIndex((c) => c.id === componentId);
						
						if (lastSelectedIndex === -1 || clickedIndex === -1) {
							finalSelectedIds = [...selectedComponentIds, componentId];
						} else {
							const startIndex = Math.min(lastSelectedIndex, clickedIndex);
							const endIndex = Math.max(lastSelectedIndex, clickedIndex);
							const rangeIds = components
								.slice(startIndex, endIndex + 1)
								.map((c) => c.id);
							
							// Merge with existing selection, avoiding duplicates
							finalSelectedIds = [...new Set([...selectedComponentIds, ...rangeIds])];
						}
					}
				} else {
					// Regular click: 
					// - If clicking on an already-selected component in a multi-selection, preserve the selection
					// - Otherwise, select only this component
					if (selectedComponentIds.length > 1 && selectedComponentIds.includes(componentId)) {
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
					const initialStates = new Map<string, { width: number; height: number; x: number; y: number }>();
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
			if (resizingComponentId && resizeDirection) {
				if (resizeDirection === "width" && resizeStartX !== null && resizeStartWidth !== null) {
					const deltaX = point.x - resizeStartX;
					const newWidth = Math.max(50, resizeStartWidth + deltaX); // Minimum width

					// Snap to grid columns
					let snappedWidth = newWidth;
					if (snapToGrid) {
						const numColumns = Math.round(newWidth / gridCellWidth);
						snappedWidth = numColumns * gridCellWidth;
					}

					// Apply resize to all selected components
					const updatedComponents = components.map((comp) => {
						if (selectedComponentIds.includes(comp.id)) {
							if (resizeMode === "clone") {
								// In clone mode, all selected components match the resized component's width
								return {
									...comp,
									width: snappedWidth,
								};
							} else {
								// Relative mode: calculate scale factor based on the resized component
								const scaleFactor = snappedWidth / resizeStartWidth;
								const initialState = initialSelectedComponentStates.get(comp.id);
								if (initialState) {
									const newCompWidth = Math.max(50, initialState.width * scaleFactor);
									return {
										...comp,
										width: snapToGrid ? Math.round(newCompWidth / gridCellWidth) * gridCellWidth : newCompWidth,
									};
								}
							}
						}
						return comp;
					});
					onComponentsChange(updatedComponents);
					return;
				} else if (resizeDirection === "height" && resizeStartY !== null && resizeStartHeight !== null) {
					const deltaY = point.y - resizeStartY;
					const newHeight = Math.max(30, resizeStartHeight + deltaY); // Minimum height

					// Snap to grid rows
					let snappedHeight = newHeight;
					if (snapToGrid) {
						const numRows = Math.round(newHeight / gridCellHeight);
						snappedHeight = numRows * gridCellHeight;
					}

					// Apply resize to all selected components
					const updatedComponents = components.map((comp) => {
						if (selectedComponentIds.includes(comp.id)) {
							if (resizeMode === "clone") {
								// In clone mode, all selected components match the resized component's height
								return {
									...comp,
									height: snappedHeight,
								};
							} else {
								// Relative mode: calculate scale factor based on the resized component
								const scaleFactor = snappedHeight / resizeStartHeight;
								const initialState = initialSelectedComponentStates.get(comp.id);
								if (initialState) {
									const newCompHeight = Math.max(30, initialState.height * scaleFactor);
									return {
										...comp,
										height: snapToGrid ? Math.round(newCompHeight / gridCellHeight) * gridCellHeight : newCompHeight,
									};
								}
							}
						}
						return comp;
					});
					onComponentsChange(updatedComponents);
					return;
				}
			}

			// Handle dragging
			if (!draggedComponentId || !dragOffset) return;

			const draggedComponent = components.find((c) => c.id === draggedComponentId);
			if (!draggedComponent) return;

			const targetPoint = {
				x: point.x - dragOffset.x,
				y: point.y - dragOffset.y,
			};
			const snappedPoint = snapToGridPoint(targetPoint);
			
			// Calculate offset from initial position
			const draggedInitialState = initialSelectedComponentStates.get(draggedComponentId);
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
			resizeStartWidth,
			resizeStartY,
			resizeStartHeight,
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
		setDraggedComponentId(null);
		setDragOffset(null);
		setResizingComponentId(null);
		setResizeStartX(null);
		setResizeStartWidth(null);
		setResizeStartY(null);
		setResizeStartHeight(null);
		setResizeDirection(null);
		setInitialSelectedComponentStates(new Map());
	}, []);

	return {
		draggedComponentId,
		resizingComponentId,
		handleComponentMouseDown,
		handleContainerMouseMove,
		handleContainerMouseUp,
	};
}

