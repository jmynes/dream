// Shared utilities for component renderers

// Shared inline input style to avoid layout shifts
export const inlineInputStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  outline: "none",
  color: "inherit",
  fontSize: "inherit",
  fontFamily: "inherit",
  padding: 0,
  margin: 0,
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
};

// Helper function to determine if a color is dark (for text contrast)
export const isDarkColor = (color: string): boolean => {
  // Convert hex to RGB
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

// Helper to get text color for filled components
export const getTextColorForFilled = (bgColor: string): string => {
  return isDarkColor(bgColor) ? "#ffffff" : "#000000";
};

// Resize handle base style
export const resizeHandleBaseStyle: React.CSSProperties = {
  position: "absolute",
  width: 8,
  height: 8,
  backgroundColor: "#1976d2",
  border: "1px solid #fff",
  borderRadius: "50%",
  cursor: "pointer",
  zIndex: 1001,
};

