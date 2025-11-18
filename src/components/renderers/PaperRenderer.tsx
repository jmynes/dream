import { Paper, Typography } from "@mui/material";
import type { RendererProps } from "./rendererTypes";
import { inlineInputStyle } from "./rendererUtils";
import { useColorUtils } from "../../contexts/ColorUtilsContext";

export default function PaperRenderer({
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
  const { getTextColorForFilled } = useColorUtils();
  // Use CSS variable for live color updates, fallback to prop
  const bgColor = `var(--live-component-color, ${componentColor})`;
  
  return (
    <Paper
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: bgColor,
        ...centeredAlignment.sx,
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
          style={{
            ...inlineInputStyle,
            textAlign: "center",
            color: getTextColorForFilled(componentColor),
          }}
        />
      ) : (
        <Typography
          variant="body2"
          sx={{ color: getTextColorForFilled(componentColor) }}
        >
          {(component.props?.text as string) || "Paper"}
        </Typography>
      )}
    </Paper>
  );
}

