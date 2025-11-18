import { Button } from "@mui/material";
import type { RendererProps } from "./rendererTypes";
import { inlineInputStyle } from "./rendererUtils";
import { useColorUtils } from "../../contexts/ColorUtilsContext";

export default function ButtonRenderer({
  component,
  componentColor,
  widthProps,
  heightProps,
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
  const { sx: propsSx, ...otherProps } = (component.props || {}) as {
    sx?: unknown;
    [key: string]: unknown;
  };

  return (
    <Button
      variant="contained"
      {...otherProps}
      sx={{
        ...(widthProps.sx || {}),
        ...(heightProps.sx || {}),
        ...(centeredAlignment.sx || {}),
        backgroundColor: componentColor,
        color: getTextColorForFilled(componentColor),
        "&:hover": { backgroundColor: componentColor },
        textTransform: "none",
        ...((propsSx as object) || {}),
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
        (component.props?.text as string) || "Button"
      )}
    </Button>
  );
}

