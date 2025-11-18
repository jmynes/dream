import { Box, Typography } from "@mui/material";
import type { RendererProps } from "./rendererTypes";
import { inlineInputStyle } from "./rendererUtils";

export default function TypographyRenderer({
  component,
  componentColor,
  widthProps,
  centeredAlignment,
  isEditing,
  editingField,
  editValue,
  inputRef,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
}: RendererProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
      <Typography
        variant="body1"
        {...(component.props as object)}
        {...widthProps}
        {...centeredAlignment}
        sx={{
          ...("sx" in widthProps ? widthProps.sx : {}),
          ...(centeredAlignment.sx || {}),
          color: componentColor,
        }}
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
          (component.props?.text as string) || "Typography"
        )}
      </Typography>
    </Box>
  );
}

