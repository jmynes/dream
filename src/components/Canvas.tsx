import { Box } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CanvasComponent, ComponentType } from "../types/component";
import ComponentRenderer from "./ComponentRenderer";

interface Point {
	x: number;
	y: number;
}

interface CanvasProps {
	width?: number;
	height?: number;
	penColor?: string;
	penSize?: number;
	isDrawing?: boolean;
	isEraser?: boolean;
	components: CanvasComponent[];
	onComponentsChange: (components: CanvasComponent[]) => void;
	selectedComponentType: ComponentType | null;
	onComponentPlaced: () => void;
	snapToGrid?: boolean;
}

export default function Canvas({
	width = 800,
	height = 600,
	penColor = "#000000",
	penSize = 2,
	isDrawing = true,
	isEraser = false,
	components,
	onComponentsChange,
	selectedComponentType,
	onComponentPlaced,
	snapToGrid = false,
}: CanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [actualWidth, setActualWidth] = useState(width);
	const [actualHeight, setActualHeight] = useState(height);
	const [isDraggingPen, setIsDraggingPen] = useState(false);
	const [lastPoint, setLastPoint] = useState<Point | null>(null);
	const [draggedComponentId, setDraggedComponentId] = useState<string | null>(
		null,
	);
	const [dragOffset, setDragOffset] = useState<Point | null>(null);
	const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
		null,
	);
	const [resizingComponentId, setResizingComponentId] = useState<string | null>(
		null,
	);
	const [resizeStartX, setResizeStartX] = useState<number | null>(null);
	const [resizeStartWidth, setResizeStartWidth] = useState<number | null>(null);
	const [resizeStartY, setResizeStartY] = useState<number | null>(null);
	const [resizeStartHeight, setResizeStartHeight] = useState<number | null>(null);
	const [resizeDirection, setResizeDirection] = useState<"width" | "height" | null>(
		null,
	);
	const [brushPosition, setBrushPosition] = useState<Point | null>(null);

	const drawLine = useCallback(
		(from: Point, to: Point) => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			if (isEraser) {
				// Use destination-out composite for erasing
				ctx.globalCompositeOperation = "destination-out";
				ctx.strokeStyle = "rgba(0,0,0,1)";
			} else {
				ctx.globalCompositeOperation = "source-over";
				ctx.strokeStyle = penColor;
			}

			ctx.lineWidth = penSize;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";

			ctx.beginPath();
			ctx.moveTo(from.x, from.y);
			ctx.lineTo(to.x, to.y);
			ctx.stroke();
		},
		[penColor, penSize, isEraser],
	);

	const getPointFromEvent = useCallback(
		(e: React.MouseEvent | MouseEvent): Point => {
			const container = containerRef.current;
			if (!container) return { x: 0, y: 0 };

			const rect = container.getBoundingClientRect();
			return {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};
		},
		[],
	);

	// Grid configuration: 12 columns, rows calculated to fit canvas
	const gridColumns = 12;
	
	// Calculate grid dimensions with useMemo to ensure consistency
	// All columns will be exactly the same width, all rows exactly the same height
	const { gridCellWidth, gridCellHeight } = useMemo(() => {
		// Calculate cell width: divide canvas width by 12 columns, floor to ensure integer pixels
		const cellWidth = Math.floor(actualWidth / gridColumns);
		
		// Calculate number of rows based on 40px base height
		const rows = Math.max(1, Math.floor(actualHeight / 40));
		
		// Calculate cell height: divide canvas height by number of rows, floor to ensure integer pixels
		// This ensures all rows are exactly the same height
		const cellHeight = Math.floor(actualHeight / rows);
		
		return {
			gridCellWidth: cellWidth,
			gridCellHeight: cellHeight,
		};
	}, [actualWidth, actualHeight]);

	// Measure container size and update canvas dimensions
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateSize = () => {
			const rect = container.getBoundingClientRect();
			setActualWidth(rect.width);
			setActualHeight(rect.height);
		};

		// Initial size
		updateSize();

		// Use ResizeObserver to track size changes
		const resizeObserver = new ResizeObserver(updateSize);
		resizeObserver.observe(container);

		// Also listen to window resize as fallback
		window.addEventListener("resize", updateSize);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", updateSize);
		};
	}, []);

	// Snap point to grid
	const snapToGridPoint = useCallback(
		(point: Point): Point => {
			if (!snapToGrid) return point;

			// Use the calculated grid cell dimensions for consistency
			// Round to nearest grid point
			const snappedX = Math.round(point.x / gridCellWidth) * gridCellWidth;
			const snappedY = Math.round(point.y / gridCellHeight) * gridCellHeight;
			return { x: snappedX, y: snappedY };
		},
		[snapToGrid, gridCellWidth, gridCellHeight],
	);

	// Handle drawing on canvas
	const handleCanvasMouseDown = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			if ((!isDrawing && !isEraser) || selectedComponentType) return;

			const point = getPointFromEvent(e);
			setLastPoint(point);
			setIsDraggingPen(true);
		},
		[isDrawing, isEraser, selectedComponentType, getPointFromEvent],
	);

	// Track mouse position for brush preview
	const handleCanvasMouseMoveForBrush = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			if ((isDrawing || isEraser) && !selectedComponentType) {
				const point = getPointFromEvent(e);
				setBrushPosition(point);
			}
		},
		[isDrawing, isEraser, selectedComponentType, getPointFromEvent],
	);

	const handleCanvasMouseLeave = useCallback(() => {
		setBrushPosition(null);
	}, []);

	const handleCanvasMouseMove = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			if (
				!isDraggingPen ||
				(!isDrawing && !isEraser) ||
				!lastPoint ||
				selectedComponentType
			)
				return;

			const point = getPointFromEvent(e);
			drawLine(lastPoint, point);
			setLastPoint(point);
		},
		[
			isDraggingPen,
			isDrawing,
			isEraser,
			lastPoint,
			selectedComponentType,
			getPointFromEvent,
			drawLine,
		],
	);

	const handleCanvasMouseUp = useCallback(() => {
		setIsDraggingPen(false);
		setLastPoint(null);
	}, []);

	// Handle component placement
	const handleContainerClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			// Only place component if clicking on container background, not on existing components
			if (e.target === e.currentTarget && selectedComponentType) {
				const point = getPointFromEvent(e);
				const snappedPoint = snapToGridPoint(point);
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
			getPointFromEvent,
			snapToGridPoint,
			gridCellWidth,
			components,
			onComponentsChange,
			onComponentPlaced,
		],
	);

	// Handle component placement on overlay (when clicking empty space)
	const handleOverlayClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			// Only place if clicking on the overlay itself (empty space), not on components
			if (e.target === e.currentTarget && selectedComponentType) {
				const point = getPointFromEvent(e);
				const snappedPoint = snapToGridPoint(point);
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
			getPointFromEvent,
			snapToGridPoint,
			gridCellWidth,
			components,
			onComponentsChange,
			onComponentPlaced,
		],
	);

	// Handle component dragging
	const handleComponentMouseDown = useCallback(
		(e: React.MouseEvent, componentId: string) => {
			e.stopPropagation();

			// If eraser is active, remove the component
			if (isEraser) {
				onComponentsChange(components.filter((c) => c.id !== componentId));
				return;
			}

			const component = components.find((c) => c.id === componentId);
			if (!component) return;

			// Check if clicking on resize handle (right edge or bottom edge)
			const point = getPointFromEvent(e);
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
			} else if (isHeightResizeHandle) {
				setResizingComponentId(componentId);
				setResizeStartY(point.y);
				setResizeStartHeight(componentHeight);
				setResizeDirection("height");
			} else {
				setSelectedComponentId(componentId);
				setDragOffset({
					x: point.x - component.x,
					y: point.y - component.y,
				});
				setDraggedComponentId(componentId);
			}
		},
		[components, isEraser, getPointFromEvent, onComponentsChange],
	);

	const handleContainerMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const point = getPointFromEvent(e);

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

					const updatedComponents = components.map((comp) =>
						comp.id === resizingComponentId
							? {
									...comp,
									width: snappedWidth,
								}
							: comp,
					);
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

					const updatedComponents = components.map((comp) =>
						comp.id === resizingComponentId
							? {
									...comp,
									height: snappedHeight,
								}
							: comp,
					);
					onComponentsChange(updatedComponents);
					return;
				}
			}

			// Handle dragging
			if (!draggedComponentId || !dragOffset) return;

			const targetPoint = {
				x: point.x - dragOffset.x,
				y: point.y - dragOffset.y,
			};
			const snappedPoint = snapToGridPoint(targetPoint);
			const updatedComponents = components.map((comp) =>
				comp.id === draggedComponentId
					? {
							...comp,
							x: snappedPoint.x,
							y: snappedPoint.y,
						}
					: comp,
			);
			onComponentsChange(updatedComponents);
		},
		[
			resizingComponentId,
			resizeDirection,
			resizeStartX,
			resizeStartWidth,
			resizeStartY,
			resizeStartHeight,
			snapToGrid,
			gridCellWidth,
			gridCellHeight,
			draggedComponentId,
			dragOffset,
			components,
			getPointFromEvent,
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
	}, []);

	// Handle clicking on canvas background to deselect
	const handleCanvasBackgroundClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (e.target === e.currentTarget) {
				setSelectedComponentId(null);
			}
		},
		[],
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

			const point = getPointFromEvent(e);
			const snappedPoint = snapToGridPoint(point);
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
			getPointFromEvent,
			snapToGridPoint,
			gridCellWidth,
			components,
			onComponentsChange,
			onComponentPlaced,
		],
	);

	// Initialize canvas
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas size to match container
		canvas.width = actualWidth;
		canvas.height = actualHeight;

		// Set default background
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, actualWidth, actualHeight);
	}, [actualWidth, actualHeight]);

	// Handle keyboard events for deleting selected components
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Only handle if a component is selected and key is Backspace or Delete
			if (
				selectedComponentId &&
				(e.key === "Backspace" || e.key === "Delete")
			) {
				// Prevent default browser behavior (e.g., going back in history)
				e.preventDefault();

				// Remove the selected component
				onComponentsChange(
					components.filter((c) => c.id !== selectedComponentId),
				);
				setSelectedComponentId(null);
			}
		};

		// Add event listener
		window.addEventListener("keydown", handleKeyDown);

		// Cleanup
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [selectedComponentId, components, onComponentsChange]);

	// Hide default cursor when showing brush preview
	const cursor =
		(isDrawing || isEraser) && !selectedComponentType
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
					handleCanvasMouseMoveForBrush(e);
				}}
				onMouseUp={handleCanvasMouseUp}
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
						(isDrawing || isEraser) && !selectedComponentType ? "auto" : "none",
					cursor,
				}}
			/>
			{/* Grid overlay */}
			{snapToGrid && (
				<Box
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						pointerEvents: "none",
						zIndex: 1,
						backgroundImage: `
							linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
							linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
						`,
						backgroundSize: `${gridCellWidth}px ${gridCellHeight}px`,
					}}
				/>
			)}

			{/* Brush preview - shows brush size circle */}
			{(isDrawing || isEraser) &&
				!selectedComponentType &&
				brushPosition && (
					<Box
						sx={{
							position: "absolute",
							left: brushPosition.x - penSize / 2,
							top: brushPosition.y - penSize / 2,
							width: penSize,
							height: penSize,
							border: "1px solid",
							borderColor: isEraser ? "#f44336" : "#1976d2",
							borderRadius: "50%",
							pointerEvents: "none",
							zIndex: 3,
							boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
						}}
					/>
				)}

			{/* Component overlay */}
			<Box
				sx={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					pointerEvents: selectedComponentType ? "auto" : "none",
					zIndex: 2,
					cursor,
				}}
				onClick={handleOverlayClick}
				onMouseMove={(e) => {
					if ((isDrawing || isEraser) && !selectedComponentType) {
						const point = getPointFromEvent(e);
						setBrushPosition(point);
					}
				}}
				onMouseLeave={() => setBrushPosition(null)}
			>
				{components.map((component) => (
					<ComponentRenderer
						key={component.id}
						component={component}
						onMouseDown={handleComponentMouseDown}
						isDragging={draggedComponentId === component.id}
						isSelected={selectedComponentId === component.id}
					/>
				))}
			</Box>
		</Box>
	);
}
