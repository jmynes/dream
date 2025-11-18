import { Box, Typography } from "@mui/material";
import type { RendererProps } from "./rendererTypes";
import { inlineInputStyle } from "./rendererUtils";

export default function BoxRenderer({
  component,
  componentColor,
  centeredAlignment,
  isEditing,
  editingField,
  editValue,
  inputRef,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
}: RendererProps) {
  // Use CSS variable for live color updates, fallback to prop
  const borderColor = `var(--live-component-color, ${componentColor})`;
  // For semi-transparent background, use the CSS variable with opacity
  // We use a wrapper approach: the CSS variable will be used if set, otherwise fallback
  const baseColor = `var(--live-component-color, ${componentColor})`;
  // Use color-mix for modern browsers, with fallback
  const bgColor = `color-mix(in srgb, ${baseColor} 12.5%, transparent)`;
  
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px dashed",
        borderColor: borderColor,
        backgroundColor: bgColor,
        ...(centeredAlignment.sx || {}),
      }}
      {...(component.props as object)}
    >
      {isEditing && editingField === "text" ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onEditBlur}
          onKeyDown={onEditKeyDown}
          onClick={(e) => e.stopPropagation()}
          style={{ ...inlineInputStyle, textAlign: "center" }}
        />
      ) : (
        <Typography variant="body2">
          {(component.props?.text as string) || "Box"}
        </Typography>
      )}
    </Box>
  );
}

