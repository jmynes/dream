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

  // Use CSS variable for live color updates, fallback to prop
  const bgColor = `var(--live-component-color, ${componentColor})`;

  return (
    <Button
      variant="contained"
      {...otherProps}
      sx={{
        ...("sx" in widthProps ? widthProps.sx : {}),
        ...("sx" in heightProps ? heightProps.sx : {}),
        ...(centeredAlignment.sx || {}),
        backgroundColor: bgColor,
        color: getTextColorForFilled(componentColor), // Text color uses prop for calculation
        "&:hover": { backgroundColor: bgColor },
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

