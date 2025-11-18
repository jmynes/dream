import { useState, useRef, useCallback } from "react";

/**
 * Hook for managing eyedropper tool functionality
 */
export function useEyedropper(onColorChange: (color: string) => void) {
  const [isActive, setIsActive] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleEyedropperClick = useCallback(async () => {
    // Check if EyeDropper API is available
    if (!("EyeDropper" in window)) {
      alert("EyeDropper API is not supported in this browser. Try clicking on the canvas to sample colors manually.");
      return;
    }

    setIsActive(true);
    abortControllerRef.current = new AbortController();

    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open({
        signal: abortControllerRef.current.signal,
      });
      onColorChange(result.sRGBHex);
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== "AbortError") {
        console.error("Eyedropper error:", error);
      }
    } finally {
      setIsActive(false);
      abortControllerRef.current = null;
    }
  }, [onColorChange]);

  return {
    isActive,
    handleEyedropperClick,
  };
}

