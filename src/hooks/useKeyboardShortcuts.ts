import { useEffect } from "react";
import type { CanvasComponent, ComponentType } from "../types/component";

interface UseKeyboardShortcutsProps {
  components: CanvasComponent[];
  selectedComponentIds: string[];
  isMagicWand: boolean;
  pendingRecognition: {
    type: ComponentType;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  recognitionFailed: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  hasDrawing: boolean;
  gridCellWidth: number;
  gridCellHeight: number;
  snapToGrid: boolean;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onDeselectAll: () => void;
  onMoveSelected: (deltaX: number, deltaY: number) => void;
  onCopySelected: () => void;
  onPaste: () => void;
  onRecognizePath: () => void;
  onSubmitRecognition: () => void;
  onCancelRecognition: () => void;
}

export function useKeyboardShortcuts({
  components,
  selectedComponentIds,
  isMagicWand,
  pendingRecognition,
  recognitionFailed,
  hasDrawing,
  gridCellWidth,
  gridCellHeight,
  snapToGrid,
  onSelectAll,
  onDeleteSelected,
  onDeselectAll,
  onMoveSelected,
  onCopySelected,
  onPaste,
  onRecognizePath,
  onSubmitRecognition,
  onCancelRecognition,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Ctrl+A / Cmd+A to select all components
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (components.length > 0) {
          onSelectAll();
        }
        return;
      }

      // Handle Ctrl+C / Cmd+C to copy selected components
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
        if (selectedComponentIds.length > 0) {
          e.preventDefault();
          onCopySelected();
        }
        return;
      }

      // Handle Ctrl+V / Cmd+V to paste components
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        onPaste();
        return;
      }

      // Handle Enter key for shape recognition/submission
      if (e.key === "Enter") {
        if (pendingRecognition) {
          e.preventDefault();
          onSubmitRecognition();
          return;
        }
        if (isMagicWand && hasDrawing) {
          e.preventDefault();
          onRecognizePath();
          return;
        }
      }

      // Handle Escape key to cancel recognition or deselect components
      if (e.key === "Escape") {
        e.preventDefault();
        if (pendingRecognition || recognitionFailed || (isMagicWand && hasDrawing)) {
          onCancelRecognition();
          return;
        }
        if (selectedComponentIds.length > 0) {
          onDeselectAll();
          return;
        }
      }

      // Handle Delete/Backspace
      if (
        selectedComponentIds.length > 0 &&
        (e.key === "Backspace" || e.key === "Delete")
      ) {
        const target = e.target as HTMLElement;
        // Don't delete components if user is editing text in an input field
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        onDeleteSelected();
      }

      // Handle Arrow keys to move selected components
      if (selectedComponentIds.length > 0) {
        const target = e.target as HTMLElement;
        // Don't move components if user is editing text in an input field
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }

        let deltaX = 0;
        let deltaY = 0;

        if (e.key === "ArrowLeft") {
          e.preventDefault();
          deltaX = snapToGrid ? -gridCellWidth : -1;
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          deltaX = snapToGrid ? gridCellWidth : 1;
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          deltaY = snapToGrid ? -gridCellHeight : -1;
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          deltaY = snapToGrid ? gridCellHeight : 1;
        }

        if (deltaX !== 0 || deltaY !== 0) {
          onMoveSelected(deltaX, deltaY);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [
    components.length,
    selectedComponentIds.length,
    isMagicWand,
    pendingRecognition,
    recognitionFailed,
    hasDrawing,
    gridCellWidth,
    gridCellHeight,
    snapToGrid,
    onSelectAll,
    onDeleteSelected,
    onDeselectAll,
    onMoveSelected,
    onCopySelected,
    onPaste,
    onRecognizePath,
    onSubmitRecognition,
    onCancelRecognition,
  ]);
}

