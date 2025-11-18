import { useCallback, useRef, useState } from "react";

// EyeDropper API types (not yet in all TypeScript libs)
interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperOptions {
  signal?: AbortSignal;
}

interface EyeDropper {
  open(options?: EyeDropperOptions): Promise<EyeDropperResult>;
}

interface WindowWithEyeDropper extends Window {
  EyeDropper?: new () => EyeDropper;
}

/**
 * Hook for managing eyedropper tool functionality
 */
export function useEyedropper(onColorChange: (color: string) => void) {
  const [isActive, setIsActive] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleEyedropperClick = useCallback(async () => {
    // Check if EyeDropper API is available
    const windowWithEyeDropper = window as WindowWithEyeDropper;
    if (!windowWithEyeDropper.EyeDropper) {
      alert(
        "EyeDropper API is not supported in this browser. Try clicking on the canvas to sample colors manually.",
      );
      return;
    }

    setIsActive(true);
    abortControllerRef.current = new AbortController();

    try {
      const eyeDropper = new windowWithEyeDropper.EyeDropper();
      const result = await eyeDropper.open({
        signal: abortControllerRef.current.signal,
      });
      onColorChange(result.sRGBHex);
    } catch (error: unknown) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== "AbortError") {
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
