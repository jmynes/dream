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
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// Helper functions for hex/rgba conversion
const hexToRgba = (hex: string): { r: number; g: number; b: number; a: number } => {
  hex = hex.replace("#", "");
  
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
  
  return { r: 0, g: 0, b: 0, a: 255 };
};

const rgbaToHex = (r: number, g: number, b: number, a: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16).toUpperCase();
    return hex.length === 1 ? `0${hex}` : hex;
  };
  
  if (a === 255) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  
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

type UpdateSource = "hex" | "opacity" | "swatch" | "picker" | "external";

export default function ColorPicker({
  currentColor,
  onColorChange,
  onClose,
}: ColorPickerProps) {
  const tooltipSlotProps = { tooltip: { sx: { fontSize: "0.85rem" } } };
  
  // Single source of truth: RGBA values
  const [rgba, setRgba] = useState(() => hexToRgba(currentColor));
  
  // Track update source to prevent loops
  const updateSourceRef = useRef<UpdateSource>("external");
  const isInternalUpdateRef = useRef(false);
  
  // Sync with prop changes (external updates only)
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    
    updateSourceRef.current = "external";
    setRgba(hexToRgba(currentColor));
  }, [currentColor]);
  
  // Update parent when rgba changes internally
  const updateColor = useCallback((newRgba: { r: number; g: number; b: number; a: number }) => {
    setRgba(newRgba);
    const newColor = rgbaToHex(newRgba.r, newRgba.g, newRgba.b, newRgba.a);
    isInternalUpdateRef.current = true;
    onColorChange(newColor);
  }, [onColorChange]);
  
  // Computed values from single source of truth
  const rgbHex = useMemo(() => rgbaToRgbHex(rgba.r, rgba.g, rgba.b).replace("#", "").toUpperCase(), [rgba.r, rgba.g, rgba.b]);
  const alphaHex = useMemo(() => Math.round(rgba.a).toString(16).toUpperCase().padStart(2, "0"), [rgba.a]);
  const opacityPercent = Math.round((rgba.a / 255) * 100);
  const displayColor = rgbaToRgbHex(rgba.r, rgba.g, rgba.b);
  
  // Local state for the two input fields
  const [hexInput, setHexInput] = useState(rgbHex);
  const [alphaInput, setAlphaInput] = useState(alphaHex);
  
  // Sync inputs when rgba changes externally
  useEffect(() => {
    if (updateSourceRef.current === "external" || updateSourceRef.current === "picker" || updateSourceRef.current === "swatch") {
      setHexInput(rgbHex);
      setAlphaInput(alphaHex);
    }
  }, [rgbHex, alphaHex]);
  
  // Refs for input elements
  const hexInputRef = useRef<HTMLInputElement>(null);
  const alphaInputRef = useRef<HTMLInputElement>(null);
  
  // Handle hex input changes (RGB part)
  const handleHexInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
    if (value.length <= 6) {
      setHexInput(value);
      
      if (value.length === 6) {
        const r = parseInt(value.substring(0, 2), 16) || 0;
        const g = parseInt(value.substring(2, 4), 16) || 0;
        const b = parseInt(value.substring(4, 6), 16) || 0;
        
        updateSourceRef.current = "hex";
        updateColor({ r, g, b, a: rgba.a });
      }
    }
  }, [rgba.a, updateColor]);
  
  // Handle hex input keydown (auto-advance)
  const handleHexInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    
    // Auto-advance to alpha input when hex is complete
    if (input.value.length === 6 && /[0-9A-Fa-f]/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const newValue = input.value + e.key.toUpperCase();
      setHexInput(newValue.substring(0, 6));
      
      // Move overflow to alpha input
      const overflow = newValue.substring(6);
      if (overflow.length > 0) {
        setAlphaInput(overflow.substring(0, 2));
        alphaInputRef.current?.focus();
        alphaInputRef.current?.setSelectionRange(overflow.length, overflow.length);
      }
    }
    
    // Handle paste
    if ((e.ctrlKey || e.metaKey) && e.key === "v") {
      // Will be handled by onPaste
    }
  }, []);
  
  // Handle hex input paste
  const handleHexInputPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
    
    if (pasted.length === 8) {
      // Split 8-digit hex into both fields
      const rgb = pasted.substring(0, 6);
      const alpha = pasted.substring(6, 8);
      setHexInput(rgb);
      setAlphaInput(alpha);
      
      const r = parseInt(rgb.substring(0, 2), 16) || 0;
      const g = parseInt(rgb.substring(2, 4), 16) || 0;
      const b = parseInt(rgb.substring(4, 6), 16) || 0;
      const a = parseInt(alpha, 16) || 255;
      
      updateSourceRef.current = "hex";
      updateColor({ r, g, b, a });
      alphaInputRef.current?.focus();
    } else if (pasted.length > 0) {
      // Partial paste into hex field
      const combined = hexInput + pasted;
      const rgb = combined.substring(0, 6);
      const overflow = combined.substring(6);
      
      setHexInput(rgb);
      if (overflow.length > 0) {
        setAlphaInput(overflow.substring(0, 2));
        alphaInputRef.current?.focus();
      }
    }
  }, [hexInput, updateColor]);
  
  // Handle hex input blur
  const handleHexInputBlur = useCallback(() => {
    const normalized = hexInput.padEnd(6, "0").substring(0, 6);
    if (normalized !== hexInput) {
      setHexInput(normalized);
      
      const r = parseInt(normalized.substring(0, 2), 16) || 0;
      const g = parseInt(normalized.substring(2, 4), 16) || 0;
      const b = parseInt(normalized.substring(4, 6), 16) || 0;
      
      updateSourceRef.current = "hex";
      updateColor({ r, g, b, a: rgba.a });
    }
  }, [hexInput, rgba.a, updateColor]);
  
  // Handle alpha input changes
  const handleAlphaInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
    if (value.length <= 2) {
      setAlphaInput(value);
      
      if (value.length === 2) {
        const a = parseInt(value, 16) || 255;
        
        updateSourceRef.current = "hex";
        updateColor({ ...rgba, a });
      }
    }
  }, [rgba, updateColor]);
  
  // Handle alpha input keydown (auto-advance backwards)
  const handleAlphaInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    
    // Backspace at start moves to hex input
    if (e.key === "Backspace" && input.selectionStart === 0 && input.selectionEnd === 0) {
      if (alphaInput.length > 0) {
        // Move last char of alpha to end of hex
        const lastChar = alphaInput.substring(alphaInput.length - 1);
        setAlphaInput(alphaInput.substring(0, alphaInput.length - 1));
        const newHex = hexInput + lastChar;
        setHexInput(newHex.substring(0, 6));
        hexInputRef.current?.focus();
        const newPos = Math.min(newHex.length, 6);
        setTimeout(() => {
          hexInputRef.current?.setSelectionRange(newPos, newPos);
        }, 0);
      } else if (hexInput.length > 0) {
        // Alpha is empty, just move to hex and backspace there
        e.preventDefault();
        hexInputRef.current?.focus();
        const newHex = hexInput.substring(0, hexInput.length - 1);
        setHexInput(newHex);
        setTimeout(() => {
          hexInputRef.current?.setSelectionRange(newHex.length, newHex.length);
        }, 0);
      }
    }
  }, [hexInput, alphaInput]);
  
  // Handle alpha input blur
  const handleAlphaInputBlur = useCallback(() => {
    const normalized = alphaInput.padEnd(2, "F").substring(0, 2);
    if (normalized !== alphaInput) {
      setAlphaInput(normalized);
      
      const a = parseInt(normalized, 16) || 255;
      
      updateSourceRef.current = "hex";
      updateColor({ ...rgba, a });
    }
  }, [alphaInput, rgba, updateColor]);
  
  // Handle opacity slider changes
  const handleOpacityChange = useCallback((_event: Event, value: number | number[]) => {
    const newOpacity = Array.isArray(value) ? value[0] : value;
    const a = Math.round((newOpacity / 100) * 255);
    
    updateSourceRef.current = "opacity";
    updateColor({ ...rgba, a });
  }, [rgba, updateColor]);
  
  // Handle native color picker changes
  const handleColorPickerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    const newRgba = hexToRgba(color);
    
    // Preserve current alpha
    updateSourceRef.current = "picker";
    updateColor({ ...newRgba, a: rgba.a });
  }, [rgba.a, updateColor]);
  
  // Handle color swatch clicks
  const handleColorSwatchClick = useCallback((hex: string) => {
    const newRgba = hexToRgba(hex);
    
    // Preserve current alpha
    updateSourceRef.current = "swatch";
    updateColor({ ...newRgba, a: rgba.a });
  }, [rgba.a, updateColor]);
  
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
                  onClick={() => handleColorSwatchClick(colorItem.hex)}
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

      {/* Native color picker and hex/alpha inputs */}
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
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "flex-start", flex: 1 }}>
          <TextField
            size="small"
            label="Hex"
            value={hexInput}
            onChange={handleHexInputChange}
            onBlur={handleHexInputBlur}
            onKeyDown={handleHexInputKeyDown}
            onPaste={handleHexInputPaste}
            inputRef={hexInputRef}
            sx={{ flex: 1 }}
            inputProps={{
              maxLength: 6,
              style: { textTransform: "uppercase" },
            }}
          />
          <TextField
            size="small"
            label="Alpha"
            value={alphaInput}
            onChange={handleAlphaInputChange}
            onBlur={handleAlphaInputBlur}
            onKeyDown={handleAlphaInputKeyDown}
            inputRef={alphaInputRef}
            sx={{ width: 80 }}
            inputProps={{
              maxLength: 2,
              style: { textTransform: "uppercase" },
            }}
          />
        </Box>
      </Box>

      {/* Opacity slider */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Opacity
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {opacityPercent}%
          </Typography>
        </Box>
        <Slider
          value={opacityPercent}
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
