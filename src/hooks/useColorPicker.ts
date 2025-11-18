import { useState, useRef, useCallback, useEffect } from "react";
import { colorResultToHex, type ColorResult } from "../utils/colorUtils";

interface UseColorPickerOptions {
  color: string;
  label: string;
  selectedComponentIds?: string[];
  setLiveComponentColor?: (color: string | null, ids: string[]) => void;
  setLiveDrawerColor?: (color: string | null) => void;
  onColorChange: (color: string, timestamp?: number) => void;
}

/**
 * Hook for managing color picker state and interactions
 * Handles live color updates during dragging for Component Color
 */
export function useColorPicker({
  color,
  label,
  selectedComponentIds = [],
  setLiveComponentColor,
  setLiveDrawerColor,
  onColorChange,
}: UseColorPickerOptions) {
  const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);
  const isDraggingRef = useRef(false);
  const liveColorRef = useRef<string | null>(null);
  const [pickerColor, setPickerColor] = useState(color);
  const pickerColorTimeoutRef = useRef<number | null>(null);
  const lastPickerColorUpdateRef = useRef<number>(0);

  const isComponentColor = label === "Component Color";
  const hasSelectedComponents = selectedComponentIds.length > 0;

  // Sync picker color when color prop changes (but not during dragging)
  useEffect(() => {
    if (!isDraggingRef.current) {
      setPickerColor(color);
    }
  }, [color]);

  const handlePickerOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setPickerAnchor(event.currentTarget);
    setPickerColor(color);
  }, [color]);

  const handlePickerClose = useCallback(() => {
    setPickerAnchor(null);
    // Clear live color when picker closes
    if (isComponentColor && hasSelectedComponents && isDraggingRef.current) {
      isDraggingRef.current = false;
      liveColorRef.current = null;
      setLiveComponentColor?.(null, selectedComponentIds);
      setLiveDrawerColor?.(null);
      if (pickerColorTimeoutRef.current !== null) {
        clearTimeout(pickerColorTimeoutRef.current);
        pickerColorTimeoutRef.current = null;
      }
      setPickerColor(color);
    }
  }, [
    isComponentColor,
    hasSelectedComponents,
    selectedComponentIds,
    setLiveComponentColor,
    setLiveDrawerColor,
    color,
  ]);

  const handleColorChange = useCallback(
    (colorResult: ColorResult) => {
      const hexColor = colorResultToHex(colorResult);

      // For Component Color, use live color updates during dragging
      if (isComponentColor && hasSelectedComponents) {
        isDraggingRef.current = true;
        liveColorRef.current = hexColor;
        setLiveComponentColor?.(hexColor, selectedComponentIds);
        setLiveDrawerColor?.(hexColor);

        // Throttle picker color updates to ~60fps
        const now = Date.now();
        if (now - lastPickerColorUpdateRef.current >= 16) {
          setPickerColor(hexColor);
          lastPickerColorUpdateRef.current = now;
          if (pickerColorTimeoutRef.current !== null) {
            clearTimeout(pickerColorTimeoutRef.current);
            pickerColorTimeoutRef.current = null;
          }
        } else {
          if (pickerColorTimeoutRef.current === null) {
            const delay = 16 - (now - lastPickerColorUpdateRef.current);
            pickerColorTimeoutRef.current = window.setTimeout(() => {
              setPickerColor(hexColor);
              lastPickerColorUpdateRef.current = Date.now();
              pickerColorTimeoutRef.current = null;
            }, delay);
          }
        }
      } else {
        setPickerColor(hexColor);
        onColorChange(hexColor, isComponentColor ? Date.now() : undefined);
      }
    },
    [
      isComponentColor,
      hasSelectedComponents,
      selectedComponentIds,
      setLiveComponentColor,
      setLiveDrawerColor,
      onColorChange,
    ],
  );

  const handleColorChangeComplete = useCallback(
    (colorResult: ColorResult) => {
      const hexColor = colorResultToHex(colorResult);

      // For Component Color, commit the change and clear live color
      if (isComponentColor && hasSelectedComponents) {
        isDraggingRef.current = false;
        liveColorRef.current = null;
        setLiveComponentColor?.(null, selectedComponentIds);
        setLiveDrawerColor?.(null);
        setPickerColor(hexColor);
        onColorChange(hexColor, Date.now());
      } else {
        setPickerColor(hexColor);
        onColorChange(hexColor, isComponentColor ? Date.now() : undefined);
      }
    },
    [
      isComponentColor,
      hasSelectedComponents,
      selectedComponentIds,
      setLiveComponentColor,
      setLiveDrawerColor,
      onColorChange,
    ],
  );

  return {
    pickerAnchor,
    pickerColor,
    handlePickerOpen,
    handlePickerClose,
    handleColorChange,
    handleColorChangeComplete,
  };
}

