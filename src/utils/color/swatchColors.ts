// Material color swatches with names
export interface SwatchColor {
  hex: string;
  name: string;
}

export const swatchColors: SwatchColor[] = [
  // Blues & Teals
  { hex: "#1976D2", name: "Primary Blue" },
  { hex: "#2196F3", name: "Blue" },
  { hex: "#03A9F4", name: "Light Blue" },
  { hex: "#00BCD4", name: "Cyan" },
  { hex: "#0097A7", name: "Teal" },
  { hex: "#40E0D0", name: "Turquoise" },
  // Purples & Reds
  { hex: "#7B1FA2", name: "Deep Purple" },
  { hex: "#9C27B0", name: "Purple" },
  { hex: "#E91E63", name: "Pink" },
  { hex: "#F44336", name: "Red" },
  { hex: "#FF5722", name: "Deep Orange" },
  { hex: "#FF9800", name: "Orange" },
  // Greens & Yellows
  { hex: "#4CAF50", name: "Green" },
  { hex: "#8BC34A", name: "Light Green" },
  { hex: "#CDDC39", name: "Lime" },
  { hex: "#D4AF37", name: "Gold" },
  { hex: "#FFEB3B", name: "Yellow" },
  { hex: "#FFE135", name: "Banana" },
  // Neutrals
  { hex: "#212121", name: "Grey 900" },
  { hex: "#616161", name: "Grey 700" },
  { hex: "#9E9E9E", name: "Grey 500" },
  { hex: "#E0E0E0", name: "Grey 300" },
  { hex: "#F5F5F5", name: "Grey 100" },
  { hex: "#FFFFFF", name: "White" },
];

