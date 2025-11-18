import { createContext, useCallback, useContext, useMemo, useRef } from "react";

interface ColorUtilsContextValue {
  isDarkColor: (color: string) => boolean;
  getTextColorForFilled: (bgColor: string) => string;
  setLiveComponentColor: (color: string | null, selectedIds: string[]) => void;
  setLiveDrawerColor: (color: string | null) => void;
  registerDrawerContainer: (element: HTMLElement | null) => void;
}

const ColorUtilsContext = createContext<ColorUtilsContextValue | null>(null);

// Cache for color calculations
const colorCache = new Map<string, boolean>();
const textColorCache = new Map<string, string>();

// Helper function to determine if a color is dark (for text contrast)
const isDarkColorImpl = (color: string): boolean => {
  // Check cache first
  const cached = colorCache.get(color);
  if (cached !== undefined) {
    return cached;
  }

  // Handle 8-digit hex (with alpha) - extract RGB part
  let hex = color.replace("#", "");
  if (hex.length === 8) {
    hex = hex.substring(0, 6);
  }

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const isDark = luminance < 0.5;

  // Cache result
  colorCache.set(color, isDark);

  return isDark;
};

// Helper to get text color for filled components
const getTextColorForFilledImpl = (bgColor: string): string => {
  // Check cache first
  const cached = textColorCache.get(bgColor);
  if (cached !== undefined) {
    return cached;
  }

  const textColor = isDarkColorImpl(bgColor) ? "#ffffff" : "#000000";

  // Cache result
  textColorCache.set(bgColor, textColor);

  return textColor;
};

interface ColorUtilsProviderProps {
  children: React.ReactNode;
}

export function ColorUtilsProvider({ children }: ColorUtilsProviderProps) {
  const liveColorRef = useRef<string | null>(null);
  const selectedIdsRef = useRef<string[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  // Cache element references to avoid repeated DOM queries
  const elementCacheRef = useRef<Map<string, HTMLElement>>(new Map());
  // Ref for drawer container element
  const drawerContainerRef = useRef<HTMLElement | null>(null);
  const drawerAnimationFrameRef = useRef<number | null>(null);

  // Update element cache when selected IDs change
  const updateElementCache = useCallback((selectedIds: string[]) => {
    const cache = elementCacheRef.current;
    const newCache = new Map<string, HTMLElement>();

    // Update cache with current selected IDs
    selectedIds.forEach((id) => {
      // Check if element is already cached and still in DOM
      const cached = cache.get(id);
      if (cached && document.contains(cached)) {
        newCache.set(id, cached);
      } else {
        // Query for new element
        const element = document.querySelector(
          `[data-component-id="${id}"]`,
        ) as HTMLElement | null;
        if (element) {
          newCache.set(id, element);
        }
      }
    });

    elementCacheRef.current = newCache;
  }, []);

  // Update live color for selected components using CSS custom properties
  const setLiveComponentColor = useCallback(
    (color: string | null, selectedIds: string[]) => {
      liveColorRef.current = color;
      const idsChanged =
        selectedIdsRef.current.length !== selectedIds.length ||
        selectedIdsRef.current.some((id, i) => id !== selectedIds[i]);

      if (idsChanged) {
        selectedIdsRef.current = selectedIds;
        updateElementCache(selectedIds);
      }

      // Cancel any pending animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Schedule DOM update on next frame
      animationFrameRef.current = requestAnimationFrame(() => {
        const cache = elementCacheRef.current;

        if (color === null) {
          // Clear live color - remove CSS variable from all cached elements
          cache.forEach((element) => {
            element.style.removeProperty("--live-component-color");
          });
        } else {
          // Set live color via CSS custom property on all cached elements
          cache.forEach((element) => {
            element.style.setProperty("--live-component-color", color);
          });
        }
        animationFrameRef.current = null;
      });
    },
    [updateElementCache],
  );

  // Update live color for drawer previews using CSS custom properties
  const setLiveDrawerColor = useCallback((color: string | null) => {
    // Cancel any pending animation frame
    if (drawerAnimationFrameRef.current !== null) {
      cancelAnimationFrame(drawerAnimationFrameRef.current);
    }

    // Schedule DOM update on next frame
    drawerAnimationFrameRef.current = requestAnimationFrame(() => {
      const container = drawerContainerRef.current;

      if (container) {
        if (color === null) {
          // Clear live color - remove CSS variable
          container.style.removeProperty("--drawer-component-color");
        } else {
          // Set live color via CSS custom property
          container.style.setProperty("--drawer-component-color", color);
        }
      }
      drawerAnimationFrameRef.current = null;
    });
  }, []);

  // Expose function to register drawer container
  const registerDrawerContainer = useCallback((element: HTMLElement | null) => {
    drawerContainerRef.current = element;
  }, []);

  const value = useMemo(
    () => ({
      isDarkColor: isDarkColorImpl,
      getTextColorForFilled: getTextColorForFilledImpl,
      setLiveComponentColor,
      setLiveDrawerColor,
      registerDrawerContainer,
    }),
    [setLiveComponentColor, setLiveDrawerColor, registerDrawerContainer],
  );

  return (
    <ColorUtilsContext.Provider value={value}>
      {children}
    </ColorUtilsContext.Provider>
  );
}

export function useColorUtils() {
  const context = useContext(ColorUtilsContext);
  if (!context) {
    throw new Error("useColorUtils must be used within ColorUtilsProvider");
  }
  return context;
}
