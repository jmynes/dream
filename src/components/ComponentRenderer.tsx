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
	const componentHeight = component.height;

	const containerStyle: React.CSSProperties = {
		position: "absolute",
		left: component.x,
		top: component.y,
		cursor: isDragging ? "grabbing" : "grab",
		userSelect: "none",
		zIndex: 10,
		pointerEvents: "auto",
		width: componentWidth ? `${componentWidth}px` : "auto",
		height: componentHeight ? `${componentHeight}px` : "auto",
	};

	const resizeHandleBaseStyle: React.CSSProperties = {
		position: "absolute",
		width: 16,
		height: 16,
		backgroundColor: isSelected ? "#1976d2" : "rgba(25, 118, 210, 0.5)",
		border: "2px solid #fff",
		borderRadius: "2px",
		zIndex: 11,
		boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
	};

	const widthResizeHandleStyle: React.CSSProperties = {
		...resizeHandleBaseStyle,
		right: -8,
		top: "50%",
		transform: "translateY(-50%)",
		cursor: "ew-resize",
	};

	const heightResizeHandleStyle: React.CSSProperties = {
		...resizeHandleBaseStyle,
		bottom: -8,
		left: "50%",
		transform: "translateX(-50%)",
		cursor: "ns-resize",
	};

	const renderComponent = () => {
		const widthProps = componentWidth ? { sx: { width: "100%" } } : {};
		const centeredAlignment = { sx: { textAlign: "center" as const } };

		switch (component.type) {
			case "Button": {
				const { sx: propsSx, ...otherProps } = (component.props || {}) as {
					sx?: unknown;
					[key: string]: unknown;
				};
				return (
					<Button
						variant="contained"
						{...otherProps}
						sx={{
							...(widthProps.sx || {}),
							...(centeredAlignment.sx || {}),
							...(propsSx as object || {}),
						}}
					>
						{(component.props?.text as string) || "Button"}
					</Button>
				);
			}
			case "TextField":
				return (
					<TextField
						label={(component.props?.label as string) || "Text Field"}
						size="small"
						{...(component.props as object)}
						{...widthProps}
						sx={{
							...(widthProps.sx || {}),
							"& input": { textAlign: "center" },
						}}
					/>
				);
			case "Card":
				return (
					<Card sx={{ width: "100%", height: "100%", minWidth: componentWidth || 200 }}>
						<CardContent sx={{ textAlign: "center", height: "100%" }}>
							<Typography variant="body2">
								{(component.props?.text as string) || "Card Content"}
							</Typography>
						</CardContent>
					</Card>
				);
			case "Typography":
				return (
					<Typography
						variant="body1"
						{...(component.props as object)}
						{...widthProps}
						{...centeredAlignment}
					>
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
				<>
					{/* Width resize handle (right edge) */}
					{/* biome-ignore lint/a11y/noStaticElementInteractions: Resize handle */}
					<div style={widthResizeHandleStyle} onMouseDown={handleMouseDown} />
					{/* Height resize handle (bottom edge) */}
					{/* biome-ignore lint/a11y/noStaticElementInteractions: Resize handle */}
					<div style={heightResizeHandleStyle} onMouseDown={handleMouseDown} />
				</>
			)}
		</div>
	);
}
