import { createContext, useContext, useMemo, useCallback } from "react";

interface ColorUtilsContextValue {
  isDarkColor: (color: string) => boolean;
  getTextColorForFilled: (bgColor: string) => string;
}

const ColorUtilsContext = createContext<ColorUtilsContextValue | null>(null);

// Cache for color calculations
const colorCache = new Map<string, boolean>();
const textColorCache = new Map<string, string>();

// Helper function to determine if a color is dark (for text contrast)
const isDarkColorImpl = (color: string): boolean => {
  // Check cache first
  if (colorCache.has(color)) {
    return colorCache.get(color)!;
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
  if (textColorCache.has(bgColor)) {
    return textColorCache.get(bgColor)!;
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
  const value = useMemo(
    () => ({
      isDarkColor: isDarkColorImpl,
      getTextColorForFilled: getTextColorForFilledImpl,
    }),
    []
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

