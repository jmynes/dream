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
        "& input": { textAlign: "center", color: componentColor },
        "& .MuiOutlinedInput-root": {
          "& fieldset": { borderColor: componentColor },
          "&:hover fieldset": { borderColor: componentColor },
          "&.Mui-focused fieldset": { borderColor: componentColor },
        },
      }}
    />
  );
}

