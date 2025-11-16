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
	isSelected?: boolean;
}

export default function ComponentRenderer({
	component,
	onMouseDown,
	isDragging = false,
	isSelected = false,
}: ComponentRendererProps) {
	const handleMouseDown = (e: React.MouseEvent) => {
		e.stopPropagation();
		onMouseDown(e, component.id);
	};

	const componentWidth = component.width;

	const containerStyle: React.CSSProperties = {
		position: "absolute",
		left: component.x,
		top: component.y,
		cursor: isDragging ? "grabbing" : "grab",
		userSelect: "none",
		zIndex: 10,
		pointerEvents: "auto",
		width: componentWidth ? `${componentWidth}px` : "auto",
	};

	const resizeHandleStyle: React.CSSProperties = {
		position: "absolute",
		right: -8,
		top: "50%",
		transform: "translateY(-50%)",
		width: 16,
		height: 16,
		cursor: "ew-resize",
		backgroundColor: isSelected ? "#1976d2" : "rgba(25, 118, 210, 0.5)",
		border: "2px solid #fff",
		borderRadius: "2px",
		zIndex: 11,
		boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
	};

	const renderComponent = () => {
		const widthProps = componentWidth
			? { sx: { width: "100%" } }
			: {};

		switch (component.type) {
			case "Button":
				return (
					<Button
						variant="contained"
						{...(component.props as object)}
						{...widthProps}
					>
						{(component.props?.text as string) || "Button"}
					</Button>
				);
			case "TextField":
				return (
					<TextField
						label={(component.props?.label as string) || "Text Field"}
						size="small"
						{...(component.props as object)}
						{...widthProps}
					/>
				);
			case "Card":
				return (
					<Card sx={{ width: "100%", minWidth: componentWidth || 200 }}>
						<CardContent>
							<Typography variant="body2">
								{(component.props?.text as string) || "Card Content"}
							</Typography>
						</CardContent>
					</Card>
				);
			case "Typography":
				return (
					<Typography variant="body1" {...(component.props as object)} {...widthProps}>
						{(component.props?.text as string) || "Typography"}
					</Typography>
				);
			default:
				return null;
		}
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: Draggable container wrapper
		<div style={containerStyle} onMouseDown={handleMouseDown}>
			{renderComponent()}
			{isSelected && (
				// biome-ignore lint/a11y/noStaticElementInteractions: Resize handle
				<div style={resizeHandleStyle} onMouseDown={handleMouseDown} />
			)}
		</div>
	);
}
