import { Box } from "@mui/material";
import type { Point } from "../utils/canvasUtils";

interface SelectionBoxProps {
	start: Point | null;
	end: Point | null;
}

export default function SelectionBox({ start, end }: SelectionBoxProps) {
	if (!start || !end) return null;

	return (
		<Box
			sx={{
				position: "absolute",
				left: Math.min(start.x, end.x),
				top: Math.min(start.y, end.y),
				width: Math.abs(end.x - start.x),
				height: Math.abs(end.y - start.y),
				border: "2px dashed",
				borderColor: "#1976d2",
				backgroundColor: "rgba(25, 118, 210, 0.1)",
				pointerEvents: "none",
				zIndex: 4,
			}}
		/>
	);
}

