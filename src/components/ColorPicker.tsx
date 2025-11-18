import {
  amber,
  blue,
  blueGrey,
  cyan,
  deepOrange,
  deepPurple,
  green,
  grey,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from "@mui/material/colors";
import {
  Box,
  Button,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";

// Helper functions for hex/rgba conversion
const hexToRgba = (hex: string): { r: number; g: number; b: number; a: number } => {
  // Remove # if present
  hex = hex.replace("#", "");
  
  // Support both 6-digit and 8-digit hex
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b, a: 255 };
  } else if (hex.length === 8) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = parseInt(hex.substring(6, 8), 16);
    return { r, g, b, a };
  }
  
  // Fallback for invalid hex
  return { r: 0, g: 0, b: 0, a: 255 };
};

const rgbaToHex = (r: number, g: number, b: number, a: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16).toUpperCase();
    return hex.length === 1 ? `0${hex}` : hex;
  };
  
  // If alpha is 255 (fully opaque), return 6-digit hex
  if (a === 255) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  
  // Otherwise return 8-digit hex with alpha
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
};

const rgbaToRgbHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16).toUpperCase();
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const materialColorGroups = [
  {
    label: "Blues & Teals",
    colors: [
      { hex: "#1976D2", name: "Primary Blue" },
      { hex: blue[500], name: "Blue" },
      { hex: lightBlue[500], name: "Light Blue" },
      { hex: teal[500], name: "Teal" },
      { hex: cyan[500], name: "Cyan" },
      { hex: "#40E0D0", name: "Turquoise" },
    ],
  },
  {
    label: "Purples & Reds",
    colors: [
      { hex: deepPurple[500], name: "Deep Purple" },
      { hex: purple[500], name: "Purple" },
      { hex: pink[500], name: "Pink" },
      { hex: red[500], name: "Red" },
      { hex: deepOrange[500], name: "Deep Orange" },
      { hex: orange[500], name: "Orange" },
    ],
  },
  {
    label: "Greens & Yellows",
    colors: [
      { hex: green[500], name: "Green" },
      { hex: lightGreen[500], name: "Light Green" },
      { hex: lime[500], name: "Lime" },
      { hex: "#D4AF37", name: "Gold" },
      { hex: yellow[500], name: "Yellow" },
      { hex: "#FFE135", name: "Banana" },
    ],
  },
  {
    label: "Neutrals",
    colors: [
      { hex: grey[900], name: "Grey 900" },
      { hex: grey[700], name: "Grey 700" },
      { hex: grey[500], name: "Grey 500" },
      { hex: grey[300], name: "Grey 300" },
      { hex: grey[100], name: "Grey 100" },
      { hex: "#FFFFFF", name: "White" },
    ],
  },
];

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
  const tooltipSlotProps = { tooltip: { sx: { fontSize: "0.85rem" } } };
  
  // Parse current color to rgba
  const currentRgba = useMemo(() => hexToRgba(currentColor), [currentColor]);
  
  // Parse hex value - can be 6 or 8 digits
  const parseHexValue = (hex: string) => {
    if (hex.length === 6) {
      return hex;
    } else if (hex.length === 8) {
      return hex.substring(0, 6);
    }
    return hex;
  };

  const [hexValue, setHexValue] = useState(() => {
    const hex = currentColor.toUpperCase().replace("#", "");
    return hex.length === 8 ? hex : hex.padEnd(8, "F");
  });
  const [opacity, setOpacity] = useState(() => {
    const rgba = hexToRgba(currentColor);
    return Math.round((rgba.a / 255) * 100);
  });
  const [displayColor, setDisplayColor] = useState(() => {
    const rgba = hexToRgba(currentColor);
    return rgbaToRgbHex(rgba.r, rgba.g, rgba.b);
  });

  // Update local state when currentColor prop changes
  useEffect(() => {
    const hex = currentColor.toUpperCase().replace("#", "");
    const rgba = hexToRgba(currentColor);
    setHexValue(hex.length === 8 ? hex : hex.padEnd(8, "F"));
    setOpacity(Math.round((rgba.a / 255) * 100));
    setDisplayColor(rgbaToRgbHex(rgba.r, rgba.g, rgba.b));
  }, [currentColor]);

  // Update color when hex or opacity changes
  useEffect(() => {
    if (hexValue.length >= 6) {
      const rgbHex = parseHexValue(hexValue);
      const r = parseInt(rgbHex.substring(0, 2), 16) || 0;
      const g = parseInt(rgbHex.substring(2, 4), 16) || 0;
      const b = parseInt(rgbHex.substring(4, 6), 16) || 0;
      
      // Use alpha from hex if 8 digits, otherwise use opacity slider
      let a: number;
      if (hexValue.length === 8) {
        const aHex = hexValue.substring(6, 8);
        a = parseInt(aHex, 16) || 255;
        // Sync opacity slider with hex alpha (only if different to avoid loops)
        const newOpacity = Math.round((a / 255) * 100);
        if (newOpacity !== opacity) {
          setOpacity(newOpacity);
        }
      } else {
        a = Math.round((opacity / 100) * 255);
      }
      
      const newColor = rgbaToHex(r, g, b, a);
      setDisplayColor(rgbaToRgbHex(r, g, b));
      onColorChange(newColor);
    }
  }, [hexValue, opacity, onColorChange]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
    // Support both 6-digit and 8-digit hex
    if (hex.length <= 8) {
      setHexValue(hex);
    }
  };

  const handleHexBlur = () => {
    // Apply color when user leaves the field
    let hex = hexValue;
    
    // If less than 6 characters, pad with zeros for RGB part
    if (hex.length < 6) {
      hex = hex.padEnd(6, "0").substring(0, 6);
    }
    // If between 6 and 8, pad alpha to FF (fully opaque) if not complete
    else if (hex.length === 7) {
      hex = hex.padEnd(8, "F").substring(0, 8);
    }
    // If exactly 6, add alpha from opacity slider
    else if (hex.length === 6) {
      const aHex = Math.round((opacity / 100) * 255).toString(16).toUpperCase().padStart(2, "0");
      hex = hex + aHex;
    }
    
    setHexValue(hex);
  };

  const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleHexBlur();
    }
  };

  const handleOpacityChange = (_event: Event, value: number | number[]) => {
    const newOpacity = Array.isArray(value) ? value[0] : value;
    setOpacity(newOpacity);
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    const rgba = hexToRgba(color);
    const rgbHex = color.toUpperCase().replace("#", "");
    const aHex = Math.round((opacity / 100) * 255).toString(16).toUpperCase().padStart(2, "0");
    setHexValue(rgbHex + aHex);
    setDisplayColor(color);
  };

  const handleColorSwatchClick = (hex: string) => {
    const rgba = hexToRgba(hex);
    const rgbHex = hex.toUpperCase().replace("#", "");
    const aHex = Math.round((opacity / 100) * 255).toString(16).toUpperCase().padStart(2, "0");
    setHexValue(rgbHex + aHex);
    setDisplayColor(hex);
  };

  return (
    <Box sx={{ p: 2, minWidth: 300 }}>
      <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
        Choose Color
      </Typography>

      {materialColorGroups.map((group) => (
        <Box key={group.label} sx={{ mb: 1.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.5, letterSpacing: 0.5 }}
          >
            {group.label.toUpperCase()}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
              gap: 0.5,
            }}
          >
            {group.colors.map((colorItem) => (
              <Tooltip
                key={`${group.label}-${colorItem.hex}`}
                title={colorItem.name}
                slotProps={tooltipSlotProps}
              >
                <Box
                  onClick={() => {
                    handleColorSwatchClick(colorItem.hex);
                  }}
                  sx={{
                    width: "100%",
                    aspectRatio: "1",
                    backgroundColor: colorItem.hex,
                    border:
                      displayColor.toUpperCase() === colorItem.hex.toUpperCase()
                        ? "2px solid #1976d2"
                        : "1px solid #ccc",
                    borderRadius: 0.5,
                    cursor: "pointer",
                    "&:hover": {
                      border: "2px solid #1976d2",
                      transform: "scale(1.05)",
                    },
                    transition: "all 0.15s ease",
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>
      ))}

      {/* Native color picker and hex input */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
        <Box
          component="input"
          type="color"
          value={displayColor}
          onChange={handleColorPickerChange}
          sx={{
            width: 50,
            height: 40,
            border: "1px solid #ccc",
            borderRadius: 1,
            cursor: "pointer",
            padding: 0,
          }}
        />
        <TextField
          size="small"
          label="Hex"
          value={hexValue}
          onChange={handleHexChange}
          onBlur={handleHexBlur}
          onKeyDown={handleHexKeyDown}
          sx={{ flex: 1 }}
          inputProps={{
            maxLength: 8,
            style: { textTransform: "uppercase" },
          }}
          helperText={hexValue.length === 8 ? "8-digit hex (with alpha)" : "6 or 8 digit hex"}
        />
      </Box>

      {/* Opacity slider */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Opacity
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {opacity}%
          </Typography>
        </Box>
        <Slider
          value={opacity}
          onChange={handleOpacityChange}
          min={0}
          max={100}
          step={1}
          size="small"
          sx={{
            "& .MuiSlider-thumb": {
              width: 16,
              height: 16,
            },
          }}
        />
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={onClose}
        size="small"
      >
        Done
      </Button>
    </Box>
  );
}

