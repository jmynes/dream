import { Box, Radio, RadioGroup, FormControlLabel } from "@mui/material";
import type { RendererProps } from "./rendererTypes";
import { useColorUtils } from "../../contexts/ColorUtilsContext";

interface RadioRendererProps extends RendererProps {
  onRadioDoubleClick: (field: string, currentText: string) => void;
}

export default function RadioRenderer({
  component,
  componentColor,
  isEditing,
  editingField,
  editValue,
  inputRef,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
  onRadioDoubleClick,
}: RadioRendererProps) {
  const { isDarkColor } = useColorUtils();
  // Use CSS variable for live color updates, fallback to prop
  const radioColor = `var(--live-component-color, ${componentColor})`;
  
  const inlineInputStyle = {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "inherit",
    fontSize: "inherit",
    fontFamily: "inherit",
    padding: 0,
    margin: 0,
    width: "auto",
    minWidth: 0,
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        pl: 2, // Add left padding
      }}
    >
      <RadioGroup
        {...(component.props as object)}
        defaultValue={component.props?.value as string || "option1"}
        row
      >
        <FormControlLabel
          value="option1"
          control={
            <Radio
              sx={{
                color: isDarkColor(componentColor) ? radioColor : "#000000",
                "&.Mui-checked": {
                  color: radioColor,
                },
              }}
            />
          }
          label={
            isEditing && editingField === "radio1" ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => onEditChange(e.target.value)}
                onBlur={onEditBlur}
                onKeyDown={onEditKeyDown}
                onClick={(e) => e.stopPropagation()}
                size={Math.max(editValue.length || 1, 4)}
                style={inlineInputStyle}
              />
            ) : (
              <span
                data-field="radio1"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  const currentText = (component.props?.label as string) || "Option 1";
                  onRadioDoubleClick("radio1", currentText);
                }}
              >
                {(component.props?.label as string) || "Option 1"}
              </span>
            )
          }
        />
        <FormControlLabel
          value="option2"
          control={
            <Radio
              sx={{
                color: isDarkColor(componentColor) ? radioColor : "#000000",
                "&.Mui-checked": {
                  color: radioColor,
                },
              }}
            />
          }
          label={
            isEditing && editingField === "radio2" ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => onEditChange(e.target.value)}
                onBlur={onEditBlur}
                onKeyDown={onEditKeyDown}
                onClick={(e) => e.stopPropagation()}
                size={Math.max(editValue.length || 1, 4)}
                style={inlineInputStyle}
              />
            ) : (
              <span
                data-field="radio2"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  const currentText = (component.props?.label2 as string) || "Option 2";
                  onRadioDoubleClick("radio2", currentText);
                }}
              >
                {(component.props?.label2 as string) || "Option 2"}
              </span>
            )
          }
        />
      </RadioGroup>
    </Box>
  );
}

