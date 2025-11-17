import {
  GridOn as GridIcon,
  Palette as ColorIcon,
  Edit as PenIcon,
  AutoFixHigh as ThinkingPenIcon,
  NearMe as CursorIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Paper,
  Slider,
  Tooltip,
  Typography,
} from "@mui/material";

interface SidebarProps {
  penColor: string;
  onPenColorChange: (color: string) => void;
  penSize: number;
  onPenSizeChange: (size: number) => void;
  isDrawing: boolean;
  onDrawingToggle: (drawing: boolean) => void;
  snapToGrid: boolean;
  onSnapToGridToggle: (snap: boolean) => void;
  isEraser: boolean;
  onEraserToggle: (eraser: boolean) => void;
  isThinkingPen: boolean;
  onThinkingPenToggle: (thinkingPen: boolean) => void;
  onCursorMode: () => void;
  isCursorMode: boolean;
  resizeMode: "relative" | "clone";
  onResizeModeChange: (mode: "relative" | "clone") => void;
}

export default function Sidebar({
  penColor,
  onPenColorChange,
  penSize,
  onPenSizeChange,
  isDrawing,
  onDrawingToggle,
  snapToGrid,
  onSnapToGridToggle,
  isEraser,
  onEraserToggle,
  isThinkingPen,
  onThinkingPenToggle,
  onCursorMode,
  isCursorMode,
  resizeMode,
  onResizeModeChange,
}: SidebarProps) {
  return (
    <Paper
      sx={{
        width: 250,
        height: "100%",
        padding: 2,
        borderRadius: 1,
        overflow: "auto",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Tools
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Selection Tools
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Tooltip title="Cursor Mode - Select and move components">
              <IconButton
                color={isCursorMode ? "primary" : "default"}
                onClick={onCursorMode}
                size="small"
              >
                <CursorIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Pen Tool">
              <IconButton
                color={isDrawing ? "primary" : "default"}
                onClick={() => {
                  onDrawingToggle(!isDrawing);
                  if (!isDrawing) {
                    onEraserToggle(false);
                    onThinkingPenToggle(false);
                  }
                }}
                size="small"
              >
                <PenIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Eraser Tool">
              <IconButton
                color={isEraser ? "primary" : "default"}
                onClick={() => {
                  onEraserToggle(!isEraser);
                  if (!isEraser) {
                    onDrawingToggle(false);
                    onThinkingPenToggle(false);
                  }
                }}
                size="small"
              >
                <i className="fas fa-eraser" style={{ fontSize: "1.25rem" }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Thinking Pen - Draw shapes to create components">
              <IconButton
                color={isThinkingPen ? "primary" : "default"}
                onClick={() => {
                  onThinkingPenToggle(!isThinkingPen);
                  if (!isThinkingPen) {
                    onDrawingToggle(false);
                    onEraserToggle(false);
                  }
                }}
                size="small"
              >
                <ThinkingPenIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Snap to Grid">
              <IconButton
                color={snapToGrid ? "primary" : "default"}
                onClick={() => onSnapToGridToggle(!snapToGrid)}
                size="small"
              >
                <GridIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Resize Mode
          </Typography>
          <ButtonGroup size="small" fullWidth>
            <Button
              variant={resizeMode === "relative" ? "contained" : "outlined"}
              onClick={() => onResizeModeChange("relative")}
              sx={{ fontSize: "0.75rem" }}
            >
              Relative
            </Button>
            <Button
              variant={resizeMode === "clone" ? "contained" : "outlined"}
              onClick={() => onResizeModeChange("clone")}
              sx={{ fontSize: "0.75rem" }}
            >
              Clone
            </Button>
          </ButtonGroup>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {resizeMode === "relative"
              ? "Scale components proportionally"
              : "Make all components match size"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Brush Size: {penSize}px
          </Typography>
          <Slider
            value={penSize}
            onChange={(_, value) => onPenSizeChange(value as number)}
            min={1}
            max={20}
            step={1}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Brush Color
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ColorIcon sx={{ color: penColor }} />
            <input
              type="color"
              value={penColor}
              onChange={(e) => onPenColorChange(e.target.value)}
              style={{
                width: 60,
                height: 30,
                border: "1px solid #ccc",
                borderRadius: 4,
                cursor: "pointer",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
