import { Box, Avatar } from "@mui/material";
import type { RendererProps } from "./rendererTypes";
import { inlineInputStyle } from "./rendererUtils";
import { useColorUtils } from "../../contexts/ColorUtilsContext";

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
  const { getTextColorForFilled } = useColorUtils();
  // Use CSS variable for live color updates, fallback to prop
  const bgColor = `var(--live-component-color, ${componentColor})`;
  
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
          bgcolor: bgColor,
          color: `${getTextColorForFilled(componentColor)} !important`,
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

