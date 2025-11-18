import { Box, Checkbox, FormControlLabel } from "@mui/material";
import type { RendererProps } from "./rendererTypes";
import { inlineInputStyle } from "./rendererUtils";

export default function CheckboxRenderer({
  component,
  componentColor,
  isEditing,
  editingField,
  editValue,
  inputRef,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
  onDoubleClick,
}: RendererProps) {
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
      <FormControlLabel
        control={
          <Checkbox
            {...(component.props as object)}
            defaultChecked={component.props?.checked as boolean}
            sx={{ 
              color: componentColor,
              "&.Mui-checked": { 
                color: componentColor,
              },
              "& .MuiSvgIcon-root": {
                color: componentColor,
              },
              "&.Mui-checked .MuiSvgIcon-root": {
                color: componentColor,
              },
            }}
          />
        }
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
              style={{
                ...inlineInputStyle,
                minWidth: 0,
              }}
            />
          ) : (
            <span
              data-field="label"
              onDoubleClick={onDoubleClick}
            >
              {(component.props?.label as string) || "Checkbox"}
            </span>
          )
        }
      />
    </Box>
  );
}

