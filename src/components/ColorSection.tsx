import { ChromePicker } from "react-color";
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Colorize as EyedropperIcon,
  Palette as ColorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useState, useCallback, useRef } from "react";

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

// Material color swatches with names
const swatchColors = [
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

interface ColorSectionProps {
  label: string;
  color: string;
  onColorChange: (color: string, timestamp?: number) => void;
  defaultColor: string;
  resetTooltip?: string;
}

export default function ColorSection({
  label,
  color,
  onColorChange,
  defaultColor,
  resetTooltip = "Reset to default",
}: ColorSectionProps) {
  const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);
  const [isEyedropperActive, setIsEyedropperActive] = useState(false);
  const [swatchesExpanded, setSwatchesExpanded] = useState(false);
  const eyedropperAbortRef = useRef<AbortController | null>(null);
  const tooltipSlotProps = { tooltip: { sx: { fontSize: "0.85rem" } } };

  const handlePickerOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPickerAnchor(event.currentTarget);
  };

  const handlePickerClose = () => {
    setPickerAnchor(null);
  };

  const handleColorChange = useCallback((colorResult: ColorResult) => {
    const rgba = colorResult.rgb;
    const a = rgba.a ?? 1;
    const hexColor = a === 1 ? colorResult.hex : rgbaToHex(rgba.r, rgba.g, rgba.b, a);
    // Component color needs timestamp for proper updates
    onColorChange(hexColor, label === "Component Color" ? Date.now() : undefined);
  }, [onColorChange, label]);

  const handleEyedropperClick = useCallback(async () => {
    // Check if EyeDropper API is available
    if (!("EyeDropper" in window)) {
      alert("EyeDropper API is not supported in this browser. Try clicking on the canvas to sample colors manually.");
      return;
    }

    setIsEyedropperActive(true);
    eyedropperAbortRef.current = new AbortController();

    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open({ signal: eyedropperAbortRef.current.signal });
      onColorChange(result.sRGBHex, Date.now());
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== "AbortError") {
        console.error("Eyedropper error:", error);
      }
    } finally {
      setIsEyedropperActive(false);
      eyedropperAbortRef.current = null;
    }
  }, [onColorChange]);

  const handleSwatchClick = (swatchHex: string) => {
    onColorChange(swatchHex, label === "Component Color" ? Date.now() : undefined);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ColorIcon sx={{ color: "#1976d2" }} />
        <Button
          variant="outlined"
          onClick={handlePickerOpen}
          sx={{
            width: 60,
            height: 30,
            minWidth: 60,
            padding: 0,
            backgroundColor: color,
            border: "1px solid #ccc",
            "&:hover": {
              backgroundColor: color,
              border: "1px solid #999",
            },
          }}
        />
        <Popover
          open={Boolean(pickerAnchor)}
          anchorEl={pickerAnchor}
          onClose={handlePickerClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ "& > div": { boxShadow: "none !important", border: "1px solid #e0e0e0", borderRadius: "4px" } }}>
              <ChromePicker
                color={color}
                onChange={handleColorChange}
                onChangeComplete={handleColorChange}
              />
            </Box>
          </Box>
        </Popover>
        
        <Tooltip title="Eyedropper Tool" slotProps={tooltipSlotProps}>
          <IconButton
            size="small"
            onClick={handleEyedropperClick}
            disabled={isEyedropperActive}
            color={isEyedropperActive ? "primary" : "default"}
            sx={{ padding: 0.5 }}
          >
            <EyedropperIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {color !== defaultColor && (
          <Tooltip title={resetTooltip} slotProps={tooltipSlotProps}>
            <IconButton
              size="small"
              onClick={() => onColorChange(defaultColor, label === "Component Color" ? Date.now() : undefined)}
              sx={{ padding: 0.5 }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Collapsible Color Swatches */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
        <Tooltip title={swatchesExpanded ? "Hide swatches" : "Show swatches"} slotProps={tooltipSlotProps}>
          <IconButton
            size="small"
            onClick={() => setSwatchesExpanded(!swatchesExpanded)}
            sx={{ padding: 0.25 }}
          >
            {swatchesExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: "0.7rem",
            cursor: "pointer",
            userSelect: "none",
            "&:hover": {
              color: "text.primary",
            },
          }}
          onClick={() => setSwatchesExpanded(!swatchesExpanded)}
        >
          Swatches
        </Typography>
      </Box>
      <Collapse in={swatchesExpanded}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 0.5,
            mt: 0.5,
          }}
        >
          {swatchColors.map((swatchColor) => (
            <Tooltip
              key={swatchColor.hex}
              title={swatchColor.name}
              slotProps={tooltipSlotProps}
              enterDelay={500}
              enterNextDelay={200}
              placement="top"
              arrow
            >
              <Box
                onClick={() => handleSwatchClick(swatchColor.hex)}
                sx={{
                  width: "100%",
                  aspectRatio: "1",
                  backgroundColor: swatchColor.hex,
                  border:
                    color.toUpperCase() === swatchColor.hex.toUpperCase()
                      ? "2px solid #1976d2"
                      : "1px solid #ccc",
                  borderRadius: 0.5,
                  cursor: "pointer",
                  "&:hover": {
                    border: "2px solid #1976d2",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.15s ease",
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

