import { Box, Divider } from "@mui/material";
import type { RendererProps } from "./rendererTypes";

interface DividerRendererProps extends RendererProps {
  componentWidth?: number;
  componentHeight?: number;
}

export default function DividerRenderer({
  component,
  componentColor,
  componentWidth,
  componentHeight,
}: DividerRendererProps) {
  const isVertical =
    componentHeight && componentWidth && componentHeight > componentWidth;

  // Use CSS variable for live color updates, fallback to prop
  const borderColor = `var(--live-component-color, ${componentColor})`;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Divider
        {...(component.props as object)}
        orientation={isVertical ? "vertical" : "horizontal"}
        sx={{
          width: "100%",
          borderColor: borderColor,
          ...(isVertical
            ? { borderLeftWidth: "2px" }
            : { borderTopWidth: "2px" }),
        }}
      />
    </Box>
  );
}
