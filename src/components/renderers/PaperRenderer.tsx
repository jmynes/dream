import { Paper, Typography } from "@mui/material";
import type { RendererProps } from "./rendererTypes";
import { inlineInputStyle, getTextColorForFilled } from "./rendererUtils";

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
  return (
    <Paper
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: componentColor,
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

