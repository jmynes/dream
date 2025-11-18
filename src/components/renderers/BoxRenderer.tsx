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
  // For semi-transparent background, we'll update border in real-time
  // Background uses the prop directly (semi-transparent calculation is complex with CSS vars)
  const bgColor = `${componentColor}20`;
  
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

