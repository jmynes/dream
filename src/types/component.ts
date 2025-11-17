export type ComponentType =
  | "Button"
  | "TextField"
  | "Card"
  | "Typography"
  | "Checkbox"
  | "Switch"
  | "Slider"
  | "Chip"
  | "Avatar"
  | "Divider"
  | "Paper"
  | "Box";

export interface CanvasComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  width?: number; // Width in pixels, if not set uses component's natural width
  height?: number; // Height in pixels, if not set uses component's natural height
  props?: Record<string, unknown>;
}
