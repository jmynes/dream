export type ComponentType = "Button" | "TextField" | "Card" | "Typography";

export interface CanvasComponent {
	id: string;
	type: ComponentType;
	x: number;
	y: number;
	width?: number; // Width in pixels, if not set uses component's natural width
	props?: Record<string, unknown>;
}
