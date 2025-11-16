import {
	Button,
	Card,
	CardContent,
	TextField,
	Typography,
} from "@mui/material";
import type { CanvasComponent } from "../types/component";

interface ComponentRendererProps {
	component: CanvasComponent;
	onMouseDown: (e: React.MouseEvent, componentId: string) => void;
	isDragging?: boolean;
}

export default function ComponentRenderer({
	component,
	onMouseDown,
	isDragging = false,
}: ComponentRendererProps) {
	const handleMouseDown = (e: React.MouseEvent) => {
		e.stopPropagation();
		onMouseDown(e, component.id);
	};

	const style: React.CSSProperties = {
		position: "absolute",
		left: component.x,
		top: component.y,
		cursor: isDragging ? "grabbing" : "grab",
		userSelect: "none",
		zIndex: 10,
		pointerEvents: "auto", // Always allow interaction with components
	};

	switch (component.type) {
		case "Button":
			return (
				// biome-ignore lint/a11y/noStaticElementInteractions: Draggable container wrapper
				<div style={style} onMouseDown={handleMouseDown}>
					<Button variant="contained" {...(component.props as object)}>
						{(component.props?.text as string) || "Button"}
					</Button>
				</div>
			);
		case "TextField":
			return (
				// biome-ignore lint/a11y/noStaticElementInteractions: Draggable container wrapper
				<div style={style} onMouseDown={handleMouseDown}>
					<TextField
						label={(component.props?.label as string) || "Text Field"}
						size="small"
						{...(component.props as object)}
					/>
				</div>
			);
		case "Card":
			return (
				// biome-ignore lint/a11y/noStaticElementInteractions: Draggable container wrapper
				<div style={style} onMouseDown={handleMouseDown}>
					<Card sx={{ minWidth: 200 }}>
						<CardContent>
							<Typography variant="body2">
								{(component.props?.text as string) || "Card Content"}
							</Typography>
						</CardContent>
					</Card>
				</div>
			);
		case "Typography":
			return (
				// biome-ignore lint/a11y/noStaticElementInteractions: Draggable container wrapper
				<div style={style} onMouseDown={handleMouseDown}>
					<Typography variant="body1" {...(component.props as object)}>
						{(component.props?.text as string) || "Typography"}
					</Typography>
				</div>
			);
		default:
			return null;
	}
}
