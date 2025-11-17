import {
	GridOn as GridIcon,
	Palette as ColorIcon,
	Edit as PenIcon,
	AutoFixHigh as ThinkingPenIcon,
} from "@mui/icons-material";
import { Box, IconButton, Slider, Tooltip, Typography } from "@mui/material";

interface ToolbarProps {
	penColor: string;
	onPenColorChange: (color: string) => void;
	penSize: number;
	onPenSizeChange: (size: number) => void;
	isDrawing: boolean;
	onDrawingToggle: (drawing: boolean) => void;
	snapToGrid: boolean;
	onSnapToGridToggle: (snap: boolean) => void;
	isEraser: boolean;
	onEraserToggle: (eraser: boolean) => void;
	isThinkingPen: boolean;
	onThinkingPenToggle: (thinkingPen: boolean) => void;
}

export default function Toolbar({
	penColor,
	onPenColorChange,
	penSize,
	onPenSizeChange,
	isDrawing,
	onDrawingToggle,
	snapToGrid,
	onSnapToGridToggle,
	isEraser,
	onEraserToggle,
	isThinkingPen,
	onThinkingPenToggle,
}: ToolbarProps) {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 2,
				padding: 2,
				borderBottom: "1px solid #e0e0e0",
				backgroundColor: "#f5f5f5",
			}}
		>
			<Tooltip title="Pen Tool">
				<IconButton
					color={isDrawing ? "primary" : "default"}
					onClick={() => {
						onDrawingToggle(!isDrawing);
						if (!isDrawing) {
							onEraserToggle(false);
							onThinkingPenToggle(false);
						}
					}}
				>
					<PenIcon />
				</IconButton>
			</Tooltip>

			<Tooltip title="Eraser Tool">
				<IconButton
					color={isEraser ? "primary" : "default"}
					onClick={() => {
						onEraserToggle(!isEraser);
						if (!isEraser) {
							onDrawingToggle(false);
							onThinkingPenToggle(false);
						}
					}}
				>
					<i className="fas fa-eraser" style={{ fontSize: "1.25rem" }} />
				</IconButton>
			</Tooltip>

			<Tooltip title="Thinking Pen - Draw shapes to create components">
				<IconButton
					color={isThinkingPen ? "primary" : "default"}
					onClick={() => {
						onThinkingPenToggle(!isThinkingPen);
						if (!isThinkingPen) {
							onDrawingToggle(false);
							onEraserToggle(false);
						}
					}}
				>
					<ThinkingPenIcon />
				</IconButton>
			</Tooltip>

			<Tooltip title="Snap to Grid">
				<IconButton
					color={snapToGrid ? "primary" : "default"}
					onClick={() => onSnapToGridToggle(!snapToGrid)}
				>
					<GridIcon />
				</IconButton>
			</Tooltip>

			<Box
				sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 200 }}
			>
				<Typography variant="body2" sx={{ minWidth: 60 }}>
					Size: {penSize}px
				</Typography>
				<Slider
					value={penSize}
					onChange={(_, value) => onPenSizeChange(value as number)}
					min={1}
					max={20}
					step={1}
					sx={{ width: 120 }}
				/>
			</Box>

			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<ColorIcon sx={{ color: penColor }} />
				<input
					type="color"
					value={penColor}
					onChange={(e) => onPenColorChange(e.target.value)}
					style={{
						width: 40,
						height: 40,
						border: "1px solid #ccc",
						borderRadius: 4,
						cursor: "pointer",
					}}
				/>
			</Box>
		</Box>
	);
}
