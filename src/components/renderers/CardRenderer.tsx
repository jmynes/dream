import { Card, CardContent, Typography } from "@mui/material";
import type { RendererProps } from "./rendererTypes";
import { inlineInputStyle } from "./rendererUtils";

interface CardRendererProps extends RendererProps {
  componentWidth?: number;
}

export default function CardRenderer({
  component,
  componentColor,
  isEditing,
  editingField,
  editValue,
  inputRef,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
  componentWidth,
}: CardRendererProps) {
  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        minWidth: componentWidth || 200,
        border: `2px solid ${componentColor}`,
      }}
    >
      <CardContent
        sx={{
          textAlign: "center",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
            style={{
              ...inlineInputStyle,
              textAlign: "center",
            }}
          />
        ) : (
          <Typography variant="body2">
            {(component.props?.text as string) || "Card Content"}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

