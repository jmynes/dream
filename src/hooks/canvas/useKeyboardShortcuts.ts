import { useEffect } from "react";
import type { CanvasComponent, ComponentType } from "../../types/component";

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
    const pressedArrows = {
      ArrowLeft: false,
      ArrowRight: false,
      ArrowUp: false,
      ArrowDown: false,
    };
    let moveLoopId: number | null = null;
    let lastMoveTimestamp = 0;
    let holdStartTimestamp = 0;

    const stopMoveLoop = () => {
      if (moveLoopId !== null) {
        cancelAnimationFrame(moveLoopId);
        moveLoopId = null;
      }
      lastMoveTimestamp = 0;
      holdStartTimestamp = 0;
    };

    const moveLoop = (timestamp: number) => {
      const anyPressed =
        pressedArrows.ArrowLeft ||
        pressedArrows.ArrowRight ||
        pressedArrows.ArrowUp ||
        pressedArrows.ArrowDown;

      if (!anyPressed) {
        stopMoveLoop();
        return;
      }

      const intervalMs = snapToGrid ? 90 : 14;
      if (timestamp - lastMoveTimestamp >= intervalMs) {
        let deltaX = 0;
        let deltaY = 0;
        const holdDuration = holdStartTimestamp
          ? timestamp - holdStartTimestamp
          : 0;
        const speedMultiplier = snapToGrid
          ? 1
          : Math.min(32, 1 + holdDuration / 40);
        const unitX = snapToGrid ? gridCellWidth : speedMultiplier;
        const unitY = snapToGrid ? gridCellHeight : speedMultiplier;

        if (pressedArrows.ArrowLeft) deltaX -= unitX;
        if (pressedArrows.ArrowRight) deltaX += unitX;
        if (pressedArrows.ArrowUp) deltaY -= unitY;
        if (pressedArrows.ArrowDown) deltaY += unitY;

        if (deltaX !== 0 || deltaY !== 0) {
          onMoveSelected(deltaX, deltaY);
          lastMoveTimestamp = timestamp;
        }
      }

      moveLoopId = requestAnimationFrame(moveLoop);
    };

    const ensureMoveLoop = () => {
      if (moveLoopId === null) {
        moveLoopId = requestAnimationFrame((timestamp) => {
          lastMoveTimestamp = timestamp;
          if (holdStartTimestamp === 0) {
            holdStartTimestamp = timestamp;
          }
          moveLoop(timestamp);
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!(e.key in pressedArrows)) return;
      pressedArrows[e.key as keyof typeof pressedArrows] = false;
      const anyPressed =
        pressedArrows.ArrowLeft ||
        pressedArrows.ArrowRight ||
        pressedArrows.ArrowUp ||
        pressedArrows.ArrowDown;
      if (!anyPressed) {
        stopMoveLoop();
      }
    };

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
        if (
          pendingRecognition ||
          recognitionFailed ||
          (isMagicWand && hasDrawing)
        ) {
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

        if (
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowDown"
        ) {
          e.preventDefault();
          pressedArrows[e.key as keyof typeof pressedArrows] = true;
          if (holdStartTimestamp === 0) {
            holdStartTimestamp = performance.now();
          }
          ensureMoveLoop();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      stopMoveLoop();
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
