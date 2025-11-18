import { Box, Avatar } from "@mui/material";
import type { RendererProps } from "./rendererTypes";
import { inlineInputStyle, getTextColorForFilled } from "./rendererUtils";

interface AvatarRendererProps extends RendererProps {
  componentWidth?: number;
  componentHeight?: number;
}

export default function AvatarRenderer({
  component,
  componentColor,
  isEditing,
  editingField,
  editValue,
  inputRef,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
  componentWidth,
  componentHeight,
}: AvatarRendererProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Avatar
        {...(component.props as object)}
        sx={{
          width: Math.min(componentWidth || 40, componentHeight || 40),
          height: Math.min(componentWidth || 40, componentHeight || 40),
          bgcolor: componentColor,
          color: getTextColorForFilled(componentColor),
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
          (component.props?.text as string) || "A"
        )}
      </Avatar>
    </Box>
  );
}

