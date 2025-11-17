import { useCallback, useRef, useState } from "react";
import type { ComponentType } from "../types/component";
import type { CanvasComponent } from "../types/component";
import type { Point } from "../utils/canvasUtils";
import { recognizeShape } from "../utils/shapeRecognition";

interface UseThinkingPenProps {
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	penSize: number;
	components: CanvasComponent[];
	onComponentsChange: (components: CanvasComponent[]) => void;
	onComponentPlaced: () => void;
	gridCellWidth: number;
	gridCellHeight: number;
	snapToGridPoint: (point: Point) => Point;
}

export function useThinkingPen({
	canvasRef,
	penSize,
	components,
	onComponentsChange,
	onComponentPlaced,
	gridCellWidth,
	gridCellHeight,
	snapToGridPoint,
}: UseThinkingPenProps) {
	const thinkingPenPathRef = useRef<Point[]>([]);
	const [hasDrawing, setHasDrawing] = useState(false);
	const [pendingRecognition, setPendingRecognition] = useState<{
		type: ComponentType;
		x: number;
		y: number;
		width: number;
		height: number;
	} | null>(null);
	const [recognitionFailed, setRecognitionFailed] = useState<{
		x: number;
		y: number;
		width: number;
		height: number;
	} | null>(null);

	const addPathPoint = useCallback((point: Point) => {
		if (thinkingPenPathRef.current.length === 0) {
			thinkingPenPathRef.current = [point];
		} else {
			thinkingPenPathRef.current.push(point);
		}
		setHasDrawing(true);
	}, []);

	const handleRecognizePath = useCallback(() => {
		if (thinkingPenPathRef.current.length === 0) return;

		const recognizedType = recognizeShape(thinkingPenPathRef.current);
		
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

		if (recognizedType) {
			// Store pending recognition
			setPendingRecognition({
				type: recognizedType,
				x: snappedPoint.x,
				y: snappedPoint.y,
				width: width,
				height: height,
			});
			setRecognitionFailed(null);
		} else {
			// Show UI for manual component selection when recognition fails
			setRecognitionFailed({
				x: snappedPoint.x,
				y: snappedPoint.y,
				width: width,
				height: height,
			});
			setPendingRecognition(null);
		}
	}, [snapToGridPoint, gridCellWidth, gridCellHeight]);

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
		setRecognitionFailed(null);
		thinkingPenPathRef.current = [];
		setHasDrawing(false);
	}, [
		pendingRecognition,
		handleRecognizePath,
		penSize,
		components,
		onComponentsChange,
		onComponentPlaced,
		canvasRef,
	]);

	const handleSelectComponentType = useCallback(
		(type: ComponentType) => {
			if (!recognitionFailed) return;

			setPendingRecognition({
				type: type,
				x: recognitionFailed.x,
				y: recognitionFailed.y,
				width: recognitionFailed.width,
				height: recognitionFailed.height,
			});
			setRecognitionFailed(null);
		},
		[recognitionFailed],
	);

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
		setRecognitionFailed(null);
		thinkingPenPathRef.current = [];
		setHasDrawing(false);
	}, [penSize, canvasRef]);

	return {
		hasDrawing,
		pendingRecognition,
		recognitionFailed,
		addPathPoint,
		handleRecognizePath,
		handleSubmitRecognition,
		handleSelectComponentType,
		handleCancelRecognition,
	};
}

