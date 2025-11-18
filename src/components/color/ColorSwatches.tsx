import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { Box, Collapse, IconButton, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { swatchColors } from "../../utils/color/swatchColors";

interface ColorSwatchesProps {
  color: string;
  onSwatchClick: (hex: string) => void;
}

export default function ColorSwatches({
  color,
  onSwatchClick,
}: ColorSwatchesProps) {
  const [expanded, setExpanded] = useState(false);
  const tooltipSlotProps = { tooltip: { sx: { fontSize: "0.85rem" } } };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
        <Tooltip
          title={expanded ? "Hide swatches" : "Show swatches"}
          slotProps={tooltipSlotProps}
        >
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ padding: 0.25 }}
          >
            {expanded ? (
              <ExpandLessIcon fontSize="small" />
            ) : (
              <ExpandMoreIcon fontSize="small" />
            )}
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
          onClick={() => setExpanded(!expanded)}
        >
          Swatches
        </Typography>
      </Box>
      <Collapse in={expanded}>
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
                onClick={() => onSwatchClick(swatchColor.hex)}
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
    </>
  );
}
