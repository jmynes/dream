// Shared color utility functions

export type ColorResult = {
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
    a?: number;
  };
};

/**
 * Convert RGBA values to hex color string (8-digit if alpha < 1)
 */
export function rgbaToHex(r: number, g: number, b: number, a: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16).toUpperCase();
    return hex.length === 1 ? `0${hex}` : hex;
  };

  const alpha = Math.round(a * 255);
  if (alpha === 255) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
}

/**
 * Convert ColorResult from react-color to hex string
 */
export function colorResultToHex(colorResult: ColorResult): string {
  const rgba = colorResult.rgb;
  const a = rgba.a ?? 1;
  return a === 1 ? colorResult.hex : rgbaToHex(rgba.r, rgba.g, rgba.b, a);
}

/**
 * Determine if a color is dark (for text contrast)
 */
export function isDarkColor(color: string): boolean {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

/**
 * Get text color for filled components based on background color
 */
export function getTextColorForFilled(bgColor: string): string {
  return isDarkColor(bgColor) ? "#ffffff" : "#000000";
}
