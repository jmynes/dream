import {
  Palette as ColorIcon,
  Colorize as EyedropperIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback } from "react";
import { ChromePicker } from "react-color";
import { useColorUtils } from "../../contexts/ColorUtilsContext";
import { useColorPicker } from "../../hooks/color/useColorPicker";
import { useEyedropper } from "../../hooks/color/useEyedropper";
import ColorSwatches from "./ColorSwatches";

interface ColorSectionProps {
  label: string;
  color: string;
  onColorChange: (color: string, timestamp?: number) => void;
  defaultColor: string;
  resetTooltip?: string;
  selectedComponentIds?: string[];
}

export default function ColorSection({
  label,
  color,
  onColorChange,
  defaultColor,
  resetTooltip = "Reset to default",
  selectedComponentIds = [],
}: ColorSectionProps) {
  const tooltipSlotProps = { tooltip: { sx: { fontSize: "0.85rem" } } };
  const { setLiveComponentColor, setLiveDrawerColor } = useColorUtils();

  const {
    pickerAnchor,
    pickerColor,
    handlePickerOpen,
    handlePickerClose,
    handleColorChange,
    handleColorChangeComplete,
  } = useColorPicker({
    color,
    label,
    selectedComponentIds,
    setLiveComponentColor,
    setLiveDrawerColor,
    onColorChange,
  });

  const { isActive: isEyedropperActive, handleEyedropperClick } = useEyedropper(
    useCallback(
      (hex: string) => {
        onColorChange(
          hex,
          label === "Component Color" ? Date.now() : undefined,
        );
      },
      [onColorChange, label],
    ),
  );

  const handleSwatchClick = useCallback(
    (swatchHex: string) => {
      onColorChange(
        swatchHex,
        label === "Component Color" ? Date.now() : undefined,
      );
    },
    [onColorChange, label],
  );

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
            <Box
              sx={{
                "& > div": {
                  boxShadow: "none !important",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                },
              }}
            >
              <ChromePicker
                color={pickerColor}
                onChange={handleColorChange}
                onChangeComplete={handleColorChangeComplete}
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
              onClick={() =>
                onColorChange(
                  defaultColor,
                  label === "Component Color" ? Date.now() : undefined,
                )
              }
              sx={{ padding: 0.5 }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <ColorSwatches color={color} onSwatchClick={handleSwatchClick} />
    </Box>
  );
}
