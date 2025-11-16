import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
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

	// Grid configuration: 12 columns
	const gridColumns = 12;
	const gridCellWidth = width / gridColumns;
	const gridCellHeight = 40; // Row height in pixels

	// Snap point to grid
	const snapToGridPoint = useCallback(
		(point: Point): Point => {
			if (!snapToGrid) return point;

			const cellWidth = width / gridColumns;
			const cellHeight = 40;
			const snappedX = Math.round(point.x / cellWidth) * cellWidth;
			const snappedY = Math.round(point.y / cellHeight) * cellHeight;
			return { x: snappedX, y: snappedY };
		},
		[snapToGrid, width],
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

			// Check if clicking on resize handle (right edge)
			const point = getPointFromEvent(e);
			const componentWidth = component.width || 100; // Default width
			const handleRightEdge = component.x + componentWidth;
			// Resize handle is 16px wide, positioned at right-8, so extends from right-8 to right+8
			const isResizeHandle =
				point.x >= handleRightEdge - 8 && point.x <= handleRightEdge + 8;

			if (isResizeHandle) {
				setResizingComponentId(componentId);
				setResizeStartX(point.x);
				setResizeStartWidth(componentWidth);
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
			if (resizingComponentId && resizeStartX !== null && resizeStartWidth !== null) {
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
			resizeStartX,
			resizeStartWidth,
			snapToGrid,
			gridCellWidth,
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
				props: {},
			};
			onComponentsChange([...components, newComponent]);
			onComponentPlaced();
		},
		[
			getPointFromEvent,
			snapToGridPoint,
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

		// Set canvas size
		canvas.width = width;
		canvas.height = height;

		// Set default background
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, width, height);
	}, [width, height]);

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
				width,
				height,
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
					pointerEvents: selectedComponentType || isEraser ? "auto" : "none",
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
