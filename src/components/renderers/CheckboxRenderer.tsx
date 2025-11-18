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
  // Use CSS variable for live color updates, fallback to prop
  const checkboxColor = `var(--live-component-color, ${componentColor})`;

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
              color: checkboxColor,
              "&.Mui-checked": {
                color: checkboxColor,
              },
              "& .MuiSvgIcon-root": {
                color: checkboxColor,
              },
              "&.Mui-checked .MuiSvgIcon-root": {
                color: checkboxColor,
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
            // biome-ignore lint/a11y/useSemanticElements: Using span for inline editable text that doesn't look like an input
            <span
              role="textbox"
              tabIndex={0}
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
