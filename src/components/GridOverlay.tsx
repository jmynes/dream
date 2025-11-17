import { Box } from "@mui/material";

interface GridOverlayProps {
	snapToGrid: boolean;
	gridCellWidth: number;
	gridCellHeight: number;
}

export default function GridOverlay({
	snapToGrid,
	gridCellWidth,
	gridCellHeight,
}: GridOverlayProps) {
	if (!snapToGrid) return null;

	return (
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
	);
}

