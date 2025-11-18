import {
  ContentPaste as PasteIcon,
  SelectAll as SelectAllIcon,
} from "@mui/icons-material";
import { Menu, MenuItem } from "@mui/material";
import type { CanvasComponent } from "../../types/component";

interface CanvasContextMenuProps {
  anchor: { mouseX: number; mouseY: number } | null;
  copiedComponents: CanvasComponent[];
  onClose: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
}

export default function CanvasContextMenu({
  anchor,
  copiedComponents,
  onClose,
  onPaste,
  onSelectAll,
}: CanvasContextMenuProps) {
  return (
    <Menu
      open={anchor !== null}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        anchor !== null
          ? { top: anchor.mouseY, left: anchor.mouseX }
          : undefined
      }
    >
      <MenuItem
        disabled={copiedComponents.length === 0}
        onClick={() => {
          onPaste();
          onClose();
        }}
      >
        <PasteIcon sx={{ mr: 1 }} />
        Paste
      </MenuItem>
      <MenuItem
        onClick={() => {
          onSelectAll();
          onClose();
        }}
      >
        <SelectAllIcon sx={{ mr: 1 }} />
        Select All
      </MenuItem>
    </Menu>
  );
}
