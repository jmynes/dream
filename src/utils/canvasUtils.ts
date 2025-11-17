export interface Point {
	x: number;
	y: number;
}

export function getPointFromEvent(
	e: React.MouseEvent | MouseEvent,
	container: HTMLDivElement | null,
): Point {
	if (!container) return { x: 0, y: 0 };

	const rect = container.getBoundingClientRect();
	return {
		x: e.clientX - rect.left,
		y: e.clientY - rect.top,
	};
}

export function snapToGridPoint(
	point: Point,
	snapToGrid: boolean,
	gridCellWidth: number,
	gridCellHeight: number,
): Point {
	if (!snapToGrid) return point;

	// Round to nearest grid point
	const snappedX = Math.round(point.x / gridCellWidth) * gridCellWidth;
	const snappedY = Math.round(point.y / gridCellHeight) * gridCellHeight;
	return { x: snappedX, y: snappedY };
}

export function calculateAngle(p1: Point, p2: Point): number {
	return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

