import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

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
}

export default function Canvas({
	width = 800,
	height = 600,
	penColor = "#000000",
	penSize = 2,
	isDrawing = true,
}: CanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [lastPoint, setLastPoint] = useState<Point | null>(null);

	const drawLine = useCallback(
		(from: Point, to: Point) => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			ctx.strokeStyle = penColor;
			ctx.lineWidth = penSize;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";

			ctx.beginPath();
			ctx.moveTo(from.x, from.y);
			ctx.lineTo(to.x, to.y);
			ctx.stroke();
		},
		[penColor, penSize],
	);

	const getPointFromEvent = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement> | MouseEvent): Point => {
			const canvas = canvasRef.current;
			if (!canvas) return { x: 0, y: 0 };

			const rect = canvas.getBoundingClientRect();
			return {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};
		},
		[],
	);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			if (!isDrawing) return;

			const point = getPointFromEvent(e);
			setLastPoint(point);
			setIsDragging(true);
		},
		[isDrawing, getPointFromEvent],
	);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			if (!isDragging || !isDrawing || !lastPoint) return;

			const point = getPointFromEvent(e);
			drawLine(lastPoint, point);
			setLastPoint(point);
		},
		[isDragging, isDrawing, lastPoint, getPointFromEvent, drawLine],
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
		setLastPoint(null);
	}, []);

	// Handle mouse leave to stop drawing
	const handleMouseLeave = useCallback(() => {
		setIsDragging(false);
		setLastPoint(null);
	}, []);

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

	return (
		<Box
			sx={{
				border: "1px solid #e0e0e0",
				borderRadius: 1,
				overflow: "hidden",
				cursor: isDrawing ? "crosshair" : "default",
			}}
		>
			<canvas
				ref={canvasRef}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseLeave}
				style={{
					display: "block",
					width: "100%",
					height: "100%",
				}}
			/>
		</Box>
	);
}
