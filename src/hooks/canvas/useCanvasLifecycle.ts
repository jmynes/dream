import { useEffect, useRef, useState } from "react";

interface UseCanvasLifecycleProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  width: number;
  height: number;
  restoreCanvasImageData?: string | null;
}

export function useCanvasLifecycle({
  canvasRef,
  containerRef,
  width,
  height,
  restoreCanvasImageData,
}: UseCanvasLifecycleProps) {
  const [actualWidth, setActualWidth] = useState(width);
  const [actualHeight, setActualHeight] = useState(height);
  const previousRestoreDataRef = useRef<string | null>(null);
  const isRestoringRef = useRef(false);

  // Measure container size and update canvas dimensions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setActualWidth(rect.width);
      setActualHeight(rect.height);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    window.addEventListener("resize", updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, [containerRef]);

  // Initialize canvas and preserve content on resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    const isInitialSetup = oldWidth === 0 && oldHeight === 0;

    let imageData: ImageData | null = null;
    if (!isInitialSetup && oldWidth > 0 && oldHeight > 0) {
      imageData = ctx.getImageData(0, 0, oldWidth, oldHeight);
    }

    canvas.width = actualWidth;
    canvas.height = actualHeight;

    if (imageData) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = oldWidth;
      tempCanvas.height = oldHeight;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.putImageData(imageData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
      }
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, actualWidth, actualHeight);
    }
  }, [actualWidth, actualHeight, canvasRef]);

  // Restore canvas image data when provided (for undo/redo)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !restoreCanvasImageData) {
      previousRestoreDataRef.current = null;
      return;
    }

    if (restoreCanvasImageData === previousRestoreDataRef.current) return;
    previousRestoreDataRef.current = restoreCanvasImageData;

    if (actualWidth === 0 || actualHeight === 0) {
      return;
    }

    isRestoringRef.current = true;
    const timeoutId = setTimeout(() => {
      const canvasElement = canvasRef.current;
      if (!canvasElement) {
        isRestoringRef.current = false;
        return;
      }

      const ctx = canvasElement.getContext("2d");
      if (!ctx) {
        isRestoringRef.current = false;
        return;
      }

      if (
        canvasElement.width !== actualWidth ||
        canvasElement.height !== actualHeight
      ) {
        isRestoringRef.current = false;
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) {
          isRestoringRef.current = false;
          return;
        }
        const canvasEl = canvasRef.current;
        const ctx2 = canvasEl.getContext("2d");
        if (!ctx2) {
          isRestoringRef.current = false;
          return;
        }
        ctx2.clearRect(0, 0, canvasEl.width, canvasEl.height);
        ctx2.drawImage(img, 0, 0);
        isRestoringRef.current = false;
      };
      img.onerror = () => {
        isRestoringRef.current = false;
      };
      img.src = restoreCanvasImageData;
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [restoreCanvasImageData, actualWidth, actualHeight, canvasRef]);

  return { actualWidth, actualHeight };
}
