import { TextField } from "@mui/material";
import type { RendererProps } from "./rendererTypes";

export default function TextFieldRenderer({
  component,
  componentColor,
  widthProps,
  isEditing,
  editingField,
  editValue,
}: RendererProps) {
  // Use CSS variable for live color updates, fallback to prop
  const fieldColor = `var(--live-component-color, ${componentColor})`;

  return (
    <TextField
      label={(component.props?.label as string) || "Text Field"}
      size="small"
      {...(component.props as object)}
      {...widthProps}
      value={
        isEditing && editingField === "value" ? editValue : (component.props?.value as string) || ""
      }
      sx={{
        ...("sx" in widthProps ? widthProps.sx : {}),
        "& input": { textAlign: "center", color: fieldColor },
        "& .MuiOutlinedInput-root": {
          "& fieldset": { borderColor: fieldColor },
          "&:hover fieldset": { borderColor: fieldColor },
          "&.Mui-focused fieldset": { borderColor: fieldColor },
        },
      }}
    />
  );
}

