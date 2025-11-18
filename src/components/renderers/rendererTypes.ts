// Shared types for component renderers

import type { CanvasComponent } from "../../types/component";

export interface RendererProps {
  component: CanvasComponent;
  componentColor: string;
  widthProps: { sx: { width: string } } | {};
  heightProps: { sx: { height: string } } | {};
  centeredAlignment: { sx: { textAlign: "center" } };
  isEditing: boolean;
  editingField: string;
  editValue: string;
  inputRef: React.RefObject<HTMLInputElement>;
  onEditChange: (value: string) => void;
  onEditBlur: () => void;
  onEditKeyDown: (e: React.KeyboardEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  textWidthRef?: React.MutableRefObject<number>;
}

