import { useEffect } from "react";
import type { CanvasComponent, ComponentType } from "../types/component";

interface UseKeyboardShortcutsProps {
  components: CanvasComponent[];
  selectedComponentIds: string[];
  isThinkingPen: boolean;
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
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onDeselectAll: () => void;
  onRecognizePath: () => void;
  onSubmitRecognition: () => void;
  onCancelRecognition: () => void;
}

export function useKeyboardShortcuts({
  components,
  selectedComponentIds,
  isThinkingPen,
  pendingRecognition,
  recognitionFailed,
  hasDrawing,
  onSelectAll,
  onDeleteSelected,
  onDeselectAll,
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

      // Handle Enter key for shape recognition/submission
      if (e.key === "Enter") {
        if (pendingRecognition) {
          e.preventDefault();
          onSubmitRecognition();
          return;
        }
        if (isThinkingPen && hasDrawing) {
          e.preventDefault();
          onRecognizePath();
          return;
        }
      }

      // Handle Escape key to cancel recognition or deselect components
      if (e.key === "Escape") {
        e.preventDefault();
        if (pendingRecognition || recognitionFailed || (isThinkingPen && hasDrawing)) {
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
        e.preventDefault();
        onDeleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [
    components.length,
    selectedComponentIds.length,
    isThinkingPen,
    pendingRecognition,
    recognitionFailed,
    hasDrawing,
    onSelectAll,
    onDeleteSelected,
    onDeselectAll,
    onRecognizePath,
    onSubmitRecognition,
    onCancelRecognition,
  ]);
}

