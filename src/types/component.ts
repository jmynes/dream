export type ComponentType = "Button" | "TextField" | "Card" | "Typography";

export interface CanvasComponent {
	id: string;
	type: ComponentType;
	x: number;
	y: number;
	props?: Record<string, unknown>;
}
