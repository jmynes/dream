import { ChromePicker } from "react-color";
import { Box, Button } from "@mui/material";
import { useState, useEffect, useRef } from "react";

// Type for react-color color result
type ColorResult = {
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
    a?: number;
  };
};

// Convert rgba to hex with alpha (8-digit if alpha < 1)
const rgbaToHex = (r: number, g: number, b: number, a: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16).toUpperCase();
    return hex.length === 1 ? `0${hex}` : hex;
  };
  
  const alpha = Math.round(a * 255);
  if (alpha === 255) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
};

interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}

export default function ColorPicker({
  currentColor,
  onColorChange,
  onClose,
}: ColorPickerProps) {
  const [color, setColor] = useState(currentColor);
  const isInternalUpdateRef = useRef(false);
  
  // Sync with prop changes (external updates only)
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    
    setColor(currentColor);
  }, [currentColor]);
  
  // Handle color change from react-color
  const handleColorChange = (colorResult: ColorResult) => {
    setColor(colorResult.hex);
    
    // Convert rgba to hex with alpha if needed
    const rgba = colorResult.rgb;
    const a = rgba.a ?? 1;
    const hexColor = a === 1 
      ? colorResult.hex 
      : rgbaToHex(rgba.r, rgba.g, rgba.b, a);
    
    isInternalUpdateRef.current = true;
    onColorChange(hexColor);
  };
  
  // Handle color change complete (user released mouse)
  const handleColorChangeComplete = (colorResult: ColorResult) => {
    setColor(colorResult.hex);
    
    // Convert rgba to hex with alpha if needed
    const rgba = colorResult.rgb;
    const a = rgba.a ?? 1;
    const hexColor = a === 1 
      ? colorResult.hex 
      : rgbaToHex(rgba.r, rgba.g, rgba.b, a);
    
    isInternalUpdateRef.current = true;
    onColorChange(hexColor);
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ "& > div": { boxShadow: "none !important", border: "1px solid #e0e0e0", borderRadius: "4px" } }}>
        <ChromePicker
          color={color}
          onChange={handleColorChange}
          onChangeComplete={handleColorChangeComplete}
        />
      </Box>
      <Button
        variant="contained"
        fullWidth
        onClick={onClose}
        size="small"
        sx={{ mt: 2 }}
      >
        Done
      </Button>
    </Box>
  );
}
