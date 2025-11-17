import {
  GridOn as GridIcon,
  Palette as ColorIcon,
  Edit as PenIcon,
  AutoFixHigh as MagicWandIcon,
  NearMe as CursorIcon,
  Web as WebIcon,
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
  Switch,
  FormControlLabel,
} from "@mui/material";

interface SidebarProps {
  penColor: string;
  onPenColorChange: (color: string) => void;
  componentColor: string;
  onComponentColorChange: (color: string) => void;
  penSize: number;
  onPenSizeChange: (size: number) => void;
  isDrawing: boolean;
  onDrawingToggle: (drawing: boolean) => void;
  snapToGrid: boolean;
  onSnapToGridToggle: (snap: boolean) => void;
  isEraser: boolean;
  onEraserToggle: (eraser: boolean) => void;
  isMagicWand: boolean;
  onMagicWandToggle: (magicWand: boolean) => void;
  onCursorMode: () => void;
  isCursorMode: boolean;
  resizeMode: "relative" | "clone";
  onResizeModeChange: (mode: "relative" | "clone") => void;
  showTitleBar: boolean;
  onTitleBarToggle: (show: boolean) => void;
  showUrlBar: boolean;
  onUrlBarToggle: (show: boolean) => void;
  showBookmarkBar: boolean;
  onBookmarkBarToggle: (show: boolean) => void;
  onAllBrowserUIToggle: (show: boolean) => void;
  isMacOSStyle: boolean;
  onMacOSStyleToggle: (isMacOS: boolean) => void;
}

export default function Sidebar({
  penColor,
  onPenColorChange,
  componentColor,
  onComponentColorChange,
  penSize,
  onPenSizeChange,
  isDrawing,
  onDrawingToggle,
  snapToGrid,
  onSnapToGridToggle,
  isEraser,
  onEraserToggle,
  isMagicWand,
  onMagicWandToggle,
  onCursorMode,
  isCursorMode,
  resizeMode,
  onResizeModeChange,
  showTitleBar,
  onTitleBarToggle,
  showUrlBar,
  onUrlBarToggle,
  showBookmarkBar,
  onBookmarkBarToggle,
  onAllBrowserUIToggle,
  isMacOSStyle,
  onMacOSStyleToggle,
}: SidebarProps) {
  return (
    <Paper
      sx={{
        width: 250,
        height: "100%",
        padding: 2,
        borderRadius: 1,
        overflow: "auto",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
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
                    onMagicWandToggle(false);
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
                    onMagicWandToggle(false);
                  }
                }}
                size="small"
              >
                <i className="fas fa-eraser" style={{ fontSize: "1.25rem" }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Magic Wand - Draw shapes to create components">
              <IconButton
                color={isMagicWand ? "primary" : "default"}
                onClick={() => {
                  onMagicWandToggle(!isMagicWand);
                  if (!isMagicWand) {
                    onDrawingToggle(false);
                    onEraserToggle(false);
                  }
                }}
                size="small"
              >
                <MagicWandIcon />
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

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Component Color
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ColorIcon sx={{ color: componentColor }} />
            <input
              type="color"
              value={componentColor}
              onChange={(e) => onComponentColorChange(e.target.value)}
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

      {/* Browser UI Toggles - Moved to bottom */}
      <Box
        sx={{
          p: 2,
          mt: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          border: "1px solid #e0e0e0",
          borderRadius: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <WebIcon />
          <Typography variant="h6">Browser UI</Typography>
          <Switch
            checked={showTitleBar && showUrlBar && showBookmarkBar}
            onChange={(e) => onAllBrowserUIToggle(e.target.checked)}
            size="small"
          />
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={showTitleBar}
              onChange={(e) => onTitleBarToggle(e.target.checked)}
              size="small"
            />
          }
          label="Title Bar"
        />
        <FormControlLabel
          control={
            <Switch
              checked={showUrlBar}
              onChange={(e) => onUrlBarToggle(e.target.checked)}
              size="small"
            />
          }
          label="URL Bar"
        />
        <FormControlLabel
          control={
            <Switch
              checked={showBookmarkBar}
              onChange={(e) => onBookmarkBarToggle(e.target.checked)}
              size="small"
            />
          }
          label="Bookmark Bar"
        />
        <FormControlLabel
          control={
            <Switch
              checked={isMacOSStyle}
              onChange={(e) => onMacOSStyleToggle(e.target.checked)}
              size="small"
            />
          }
          label="macOS Style"
        />
      </Box>
    </Paper>
  );
}
