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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";

const materialColorGroups = [
  {
    label: "Blues & Teals",
    colors: [
      { hex: "#1976D2", name: "Primary Blue" },
      { hex: blue[500], name: "Blue" },
      { hex: lightBlue[500], name: "Light Blue" },
      { hex: cyan[500], name: "Cyan" },
      { hex: teal[500], name: "Teal" },
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
      { hex: amber[500], name: "Amber" },
      { hex: yellow[500], name: "Yellow" },
      { hex: blueGrey[500], name: "Blue Grey" },
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
  const [hexValue, setHexValue] = useState(
    currentColor.toUpperCase().replace("#", ""),
  );
  const [displayColor, setDisplayColor] = useState(currentColor);

  // Update local state when currentColor prop changes
  useEffect(() => {
    setHexValue(currentColor.toUpperCase().replace("#", ""));
    setDisplayColor(currentColor);
  }, [currentColor]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
    if (hex.length <= 6) {
      setHexValue(hex);
      // Only apply color if we have a complete 6-character hex
      if (hex.length === 6) {
        const color = `#${hex}`;
        setDisplayColor(color);
        onColorChange(color);
      }
    }
  };

  const handleHexBlur = () => {
    // Apply color when user leaves the field, padding with zeros if needed
    const hex = hexValue.padEnd(6, "0").substring(0, 6);
    const color = `#${hex}`;
    setHexValue(hex);
    setDisplayColor(color);
    onColorChange(color);
  };

  const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleHexBlur();
    }
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
                    onColorChange(colorItem.hex);
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
          onChange={(e) => onColorChange(e.target.value)}
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
            maxLength: 6,
            style: { textTransform: "uppercase" },
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

