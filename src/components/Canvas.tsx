import { Box, Button, Paper, Typography } from "@mui/material";
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
	isThinkingPen?: boolean;
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
	isThinkingPen = false,
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
	const brushAnimationFrameRef = useRef<number | null>(null);
	const thinkingPenPathRef = useRef<Point[]>([]);
	const [hasDrawing, setHasDrawing] = useState(false);
	const [pendingRecognition, setPendingRecognition] = useState<{
		type: ComponentType;
		x: number;
		y: number;
		width: number;
		height: number;
	} | null>(null);

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

	// Recognize shape from path points
	const recognizeShape = useCallback(
		(path: Point[]): ComponentType | null => {
			if (path.length < 3) return null;

			// Calculate bounding box
			let minX = Infinity,
				maxX = -Infinity,
				minY = Infinity,
				maxY = -Infinity;
			for (const point of path) {
				minX = Math.min(minX, point.x);
				maxX = Math.max(maxX, point.x);
				minY = Math.min(minY, point.y);
				maxY = Math.max(maxY, point.y);
			}

			const width = maxX - minX;
			const height = maxY - minY;
			const centerX = (minX + maxX) / 2;
			const centerY = (minY + maxY) / 2;
			const aspectRatio = width / height;

			// Check for small square (checkbox) - small size, roughly square
			if (width < 60 && height < 60 && aspectRatio > 0.7 && aspectRatio < 1.3) {
				return "Checkbox";
			}

			// Check for horizontal line (divider) - long horizontal line
			if (width > 100 && height < 20 && width / height > 5) {
				return "Divider";
			}

			// Check for vertical line (divider) - long vertical line
			if (height > 100 && width < 20 && height / width > 5) {
				return "Divider";
			}

			// Check for circle (avatar) - roughly circular path
			if (width > 30 && height > 30 && aspectRatio > 0.7 && aspectRatio < 1.3) {
				// Calculate average distance from center
				let totalDistance = 0;
				for (const point of path) {
					const dx = point.x - centerX;
					const dy = point.y - centerY;
					totalDistance += Math.sqrt(dx * dx + dy * dy);
				}
				const avgDistance = totalDistance / path.length;
				const radius = Math.max(width, height) / 2;
				// If average distance is close to radius, it's likely a circle
				if (Math.abs(avgDistance - radius) / radius < 0.3) {
					return "Avatar";
				}
			}

			// Check for rectangle (button, card, textfield)
			if (width > 50 && height > 30) {
				// Tall rectangle - likely button or textfield
				if (height > width * 1.5) {
					return "Button";
				}
				// Wide rectangle - likely card or button
				if (width > height * 2) {
					return "Card";
				}
				// Medium rectangle
				return "Button";
			}

			return null;
		},
		[],
	);

	// Handle drawing on canvas
	const handleCanvasMouseDown = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			if ((!isDrawing && !isEraser && !isThinkingPen) || selectedComponentType)
				return;

			const point = getPointFromEvent(e);
			setLastPoint(point);
			setIsDraggingPen(true);

			// Start tracking path for thinking pen
			if (isThinkingPen) {
				// If this is a new drawing session, start fresh, otherwise append
				if (thinkingPenPathRef.current.length === 0) {
					thinkingPenPathRef.current = [point];
				} else {
					thinkingPenPathRef.current.push(point);
				}
				setHasDrawing(true);
			}
		},
		[isDrawing, isEraser, isThinkingPen, selectedComponentType, getPointFromEvent],
	);

	// Track mouse position for brush preview with throttling
	const handleCanvasMouseMoveForBrush = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			if ((isDrawing || isEraser || isThinkingPen) && !selectedComponentType) {
				const point = getPointFromEvent(e);
				// Throttle updates using requestAnimationFrame
				if (brushAnimationFrameRef.current !== null) {
					cancelAnimationFrame(brushAnimationFrameRef.current);
				}
				brushAnimationFrameRef.current = requestAnimationFrame(() => {
					setBrushPosition(point);
					brushAnimationFrameRef.current = null;
				});
			}
		},
		[isDrawing, isEraser, isThinkingPen, selectedComponentType, getPointFromEvent],
	);

	const handleCanvasMouseLeave = useCallback(() => {
		if (brushAnimationFrameRef.current !== null) {
			cancelAnimationFrame(brushAnimationFrameRef.current);
			brushAnimationFrameRef.current = null;
		}
		setBrushPosition(null);
	}, []);

	const handleCanvasMouseMove = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			if (
				!isDraggingPen ||
				(!isDrawing && !isEraser && !isThinkingPen) ||
				!lastPoint ||
				selectedComponentType
			)
				return;

			const point = getPointFromEvent(e);

			// Track path for thinking pen
			if (isThinkingPen) {
				thinkingPenPathRef.current.push(point);
			}

			// Draw line for regular drawing or eraser
			if (isDrawing || isEraser) {
				drawLine(lastPoint, point);
			} else if (isThinkingPen) {
				// Draw temporary line for thinking pen
				drawLine(lastPoint, point);
			}

			setLastPoint(point);
		},
		[
			isDraggingPen,
			isDrawing,
			isEraser,
			isThinkingPen,
			lastPoint,
			selectedComponentType,
			getPointFromEvent,
			drawLine,
		],
	);

	const handleCanvasMouseUp = useCallback(() => {
		// Just reset drag state - allow multiple strokes before submit
		setIsDraggingPen(false);
		setLastPoint(null);
	}, []);

	// Recognize accumulated path and show pending UI
	const handleRecognizePath = useCallback(() => {
		if (thinkingPenPathRef.current.length === 0) return;

		const recognizedType = recognizeShape(thinkingPenPathRef.current);
		if (recognizedType) {
			// Calculate bounding box for placement
			const path = thinkingPenPathRef.current;
			let minX = Infinity,
				maxX = -Infinity,
				minY = Infinity,
				maxY = -Infinity;
			for (const point of path) {
				minX = Math.min(minX, point.x);
				maxX = Math.max(maxX, point.x);
				minY = Math.min(minY, point.y);
				maxY = Math.max(maxY, point.y);
			}

			const width = Math.max(maxX - minX, gridCellWidth);
			const height = Math.max(maxY - minY, gridCellHeight);
			const snappedPoint = snapToGridPoint({ x: minX, y: minY });

			// Store pending recognition
			setPendingRecognition({
				type: recognizedType,
				x: snappedPoint.x,
				y: snappedPoint.y,
				width: width,
				height: height,
			});
		} else {
			// Could show an error message or just do nothing
			// For now, do nothing if not recognized
		}
	}, [recognizeShape, snapToGridPoint, gridCellWidth, gridCellHeight]);

	// Handle submit of pending recognition
	const handleSubmitRecognition = useCallback(() => {
		// If no pending recognition but we have a path, recognize first
		if (!pendingRecognition && thinkingPenPathRef.current.length > 0) {
			handleRecognizePath();
			return;
		}

		if (!pendingRecognition) return;

		// Clear the drawn shape from canvas
		const canvas = canvasRef.current;
		if (canvas && thinkingPenPathRef.current.length > 0) {
			const ctx = canvas.getContext("2d");
			if (ctx) {
				const path = thinkingPenPathRef.current;
				// Save current content
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				// Clear and restore
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.putImageData(imageData, 0, 0);
				// Clear the specific area where we drew
				ctx.globalCompositeOperation = "destination-out";
				ctx.beginPath();
				ctx.moveTo(path[0].x, path[0].y);
				for (let i = 1; i < path.length; i++) {
					ctx.lineTo(path[i].x, path[i].y);
				}
				ctx.lineWidth = penSize * 2;
				ctx.lineCap = "round";
				ctx.lineJoin = "round";
				ctx.stroke();
				ctx.globalCompositeOperation = "source-over";
			}
		}

		// Place the component
		const newComponent: CanvasComponent = {
			id: `component-${Date.now()}`,
			type: pendingRecognition.type,
			x: pendingRecognition.x,
			y: pendingRecognition.y,
			width: pendingRecognition.width,
			height: pendingRecognition.height,
			props: {},
		};
		onComponentsChange([...components, newComponent]);
		onComponentPlaced();

		// Clear pending recognition and path
		setPendingRecognition(null);
		thinkingPenPathRef.current = [];
		setHasDrawing(false);
	}, [
		pendingRecognition,
		handleRecognizePath,
		penSize,
		components,
		onComponentsChange,
		onComponentPlaced,
	]);

	// Handle cancel of pending recognition
	const handleCancelRecognition = useCallback(() => {
		// Clear the drawn shape from canvas
		const canvas = canvasRef.current;
		if (canvas && thinkingPenPathRef.current.length > 0) {
			const ctx = canvas.getContext("2d");
			if (ctx) {
				const path = thinkingPenPathRef.current;
				// Save current content
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				// Clear and restore
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.putImageData(imageData, 0, 0);
				// Clear the specific area where we drew
				ctx.globalCompositeOperation = "destination-out";
				ctx.beginPath();
				ctx.moveTo(path[0].x, path[0].y);
				for (let i = 1; i < path.length; i++) {
					ctx.lineTo(path[i].x, path[i].y);
				}
				ctx.lineWidth = penSize * 2;
				ctx.lineCap = "round";
				ctx.lineJoin = "round";
				ctx.stroke();
				ctx.globalCompositeOperation = "source-over";
			}
		}

		// Clear pending recognition and path
		setPendingRecognition(null);
		thinkingPenPathRef.current = [];
		setHasDrawing(false);
	}, [penSize]);

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
				// Cancel pending recognition if clicking on background
				if (pendingRecognition || hasDrawing) {
					handleCancelRecognition();
				}
			}
		},
		[pendingRecognition, hasDrawing, handleCancelRecognition],
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

	// Initialize canvas and preserve content on resize
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const oldWidth = canvas.width;
		const oldHeight = canvas.height;
		const isInitialSetup = oldWidth === 0 && oldHeight === 0;

		// Save current canvas content if resizing (not initial setup)
		let imageData: ImageData | null = null;
		if (!isInitialSetup && oldWidth > 0 && oldHeight > 0) {
			imageData = ctx.getImageData(0, 0, oldWidth, oldHeight);
		}

		// Set canvas size to match container
		canvas.width = actualWidth;
		canvas.height = actualHeight;

		// Restore content if resizing, otherwise set default background
		if (imageData) {
			// Restore the saved content
			const tempCanvas = document.createElement("canvas");
			tempCanvas.width = oldWidth;
			tempCanvas.height = oldHeight;
			const tempCtx = tempCanvas.getContext("2d");
			if (tempCtx) {
				tempCtx.putImageData(imageData, 0, 0);
				ctx.drawImage(tempCanvas, 0, 0);
			}
		} else {
			// Set default background for initial setup
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(0, 0, actualWidth, actualHeight);
		}
	}, [actualWidth, actualHeight]);

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
		if (!isThinkingPen && (pendingRecognition || hasDrawing)) {
			handleCancelRecognition();
		}
	}, [isThinkingPen, pendingRecognition, hasDrawing, handleCancelRecognition]);

	// Handle keyboard events for deleting selected components and pending recognition
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Handle thinking pen shortcuts
			if (isThinkingPen) {
				// Enter to recognize/submit
				if (e.key === "Enter") {
					e.preventDefault();
					if (pendingRecognition) {
						handleSubmitRecognition();
					} else if (hasDrawing) {
						handleRecognizePath();
					}
					return;
				}
				// Escape to cancel
				if (e.key === "Escape") {
					e.preventDefault();
					if (pendingRecognition || hasDrawing) {
						handleCancelRecognition();
					}
					return;
				}
			}

			// Handle pending recognition keyboard shortcuts
			if (pendingRecognition) {
				if (e.key === "Enter") {
					e.preventDefault();
					handleSubmitRecognition();
					return;
				}
				if (e.key === "Escape") {
					e.preventDefault();
					handleCancelRecognition();
					return;
				}
			}

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
	}, [
		selectedComponentId,
		components,
		onComponentsChange,
		isThinkingPen,
		pendingRecognition,
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
						(isDrawing || isEraser || isThinkingPen) && !selectedComponentType
							? "auto"
							: "none",
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
			{(isDrawing || isEraser || isThinkingPen) &&
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
							borderColor: isEraser
								? "#f44336"
								: isThinkingPen
									? "#9c27b0"
									: "#1976d2",
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
					if ((isDrawing || isEraser || isThinkingPen) && !selectedComponentType) {
						const point = getPointFromEvent(e);
						// Throttle updates using requestAnimationFrame
						if (brushAnimationFrameRef.current !== null) {
							cancelAnimationFrame(brushAnimationFrameRef.current);
						}
						brushAnimationFrameRef.current = requestAnimationFrame(() => {
							setBrushPosition(point);
							brushAnimationFrameRef.current = null;
						});
					}
				}}
				onMouseLeave={() => {
					if (brushAnimationFrameRef.current !== null) {
						cancelAnimationFrame(brushAnimationFrameRef.current);
						brushAnimationFrameRef.current = null;
					}
					setBrushPosition(null);
				}}
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

			{/* Submit button for thinking pen - shown when drawing */}
			{isThinkingPen && hasDrawing && !pendingRecognition && (
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

			{/* Pending recognition UI */}
			{pendingRecognition && (
				<Paper
					sx={{
						position: "absolute",
						left: pendingRecognition.x + pendingRecognition.width / 2,
						top: pendingRecognition.y - 60,
						transform: "translateX(-50%)",
						padding: 2,
						zIndex: 100,
						display: "flex",
						flexDirection: "column",
						gap: 1,
						minWidth: 180,
						boxShadow: 3,
					}}
					onClick={(e) => e.stopPropagation()}
				>
					<Typography variant="body2" fontWeight="medium">
						Recognized: {pendingRecognition.type}
					</Typography>
					<Box sx={{ display: "flex", gap: 1 }}>
						<Button
							variant="contained"
							size="small"
							onClick={handleSubmitRecognition}
							color="primary"
						>
							Submit
						</Button>
						<Button
							variant="outlined"
							size="small"
							onClick={handleCancelRecognition}
							color="inherit"
						>
							Cancel
						</Button>
					</Box>
				</Paper>
			)}
		</Box>
	);
}

