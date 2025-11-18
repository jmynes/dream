import { Box, Chip } from "@mui/material";
import type { RendererProps } from "./rendererTypes";
import { getTextColorForFilled } from "./rendererUtils";

interface ChipRendererProps extends RendererProps {
  textWidthRef?: React.MutableRefObject<number>;
}

export default function ChipRenderer({
  component,
  componentColor,
  isEditing,
  editingField,
  editValue,
  inputRef,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
  textWidthRef,
}: ChipRendererProps) {
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
      <Chip
        {...(component.props as object)}
        label={
          isEditing && editingField === "label" ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              onBlur={onEditBlur}
              onKeyDown={onEditKeyDown}
              onClick={(e) => e.stopPropagation()}
              size={Math.max(editValue.length || 1, 4)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "inherit",
                fontSize: "inherit",
                fontFamily: "inherit",
                padding: 0,
                margin: 0,
                width: isEditing && textWidthRef?.current && textWidthRef.current > 0 ? `${textWidthRef.current}px` : "auto",
                minWidth: 0,
                maxWidth: isEditing && textWidthRef?.current && textWidthRef.current > 0 ? `${textWidthRef.current * 2}px` : "none",
              }}
            />
          ) : (
            (component.props?.label as string) || "Chip"
          )
        }
        sx={{
          backgroundColor: componentColor,
          color: getTextColorForFilled(componentColor),
          ...(isEditing && editingField === "label" && textWidthRef?.current && textWidthRef.current > 0 ? {
            width: `${textWidthRef.current + 40}px`,
            minWidth: `${textWidthRef.current + 40}px`,
            maxWidth: `${textWidthRef.current * 3 + 40}px`,
          } : {}),
        }}
      />
    </Box>
  );
}

