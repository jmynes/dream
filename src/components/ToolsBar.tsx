import {
  GridOn as GridIcon,
  Palette as ColorIcon,
  Edit as PenIcon,
  AutoFixHigh as MagicWandIcon,
  NearMe as CursorIcon,
  Web as WebIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Paper,
  Popover,
  Slider,
  Tooltip,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import ColorPicker from "./ColorPicker";


interface ToolsBarProps {
  penColor: string;
  onPenColorChange: (color: string) => void;
  componentColor: string;
  onComponentColorChange: (color: string, timestamp?: number) => void;
  canvasColor: string;
  onCanvasColorChange: (color: string) => void;
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
  resizeMode: "relative" | "match";
  onResizeModeChange: (mode: "relative" | "match") => void;
  showTitleBar: boolean;
  onTitleBarToggle: (show: boolean) => void;
  showUrlBar: boolean;
  onUrlBarToggle: (show: boolean) => void;
  showBookmarkBar: boolean;
  onBookmarkBarToggle: (show: boolean) => void;
  isBrowserUIEnabled: boolean;
  onBrowserUIEnabledToggle: (enabled: boolean) => void;
  isMacOSStyle: boolean;
  onMacOSStyleToggle: (isMacOS: boolean) => void;
}

export default function ToolsBar({
  penColor,
  onPenColorChange,
  componentColor,
  onComponentColorChange,
  canvasColor,
  onCanvasColorChange,
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
  isBrowserUIEnabled,
  onBrowserUIEnabledToggle,
  isMacOSStyle,
  onMacOSStyleToggle,
}: ToolsBarProps) {
  const tooltipSlotProps = { tooltip: { sx: { fontSize: "0.85rem" } } };
  // State for color picker popovers
  const [componentColorAnchor, setComponentColorAnchor] =
    useState<HTMLElement | null>(null);
  const [penColorAnchor, setPenColorAnchor] = useState<HTMLElement | null>(null);
  const [canvasColorAnchor, setCanvasColorAnchor] =
    useState<HTMLElement | null>(null);
  
  
  // Brush size slider refs/state for performant updates
  const [displayPenSize, setDisplayPenSize] = useState(penSize);
  const penSizeRefLocal = useRef(penSize);
  const penSizeRafRef = useRef<number | null>(null);

  useEffect(() => {
    penSizeRefLocal.current = penSize;
    setDisplayPenSize(penSize);
  }, [penSize]);

  useEffect(() => {
    return () => {
      if (penSizeRafRef.current !== null) {
        cancelAnimationFrame(penSizeRafRef.current);
      }
    };
  }, []);

  const handlePenSizeChange = (_: Event, value: number | number[]) => {
    const nextValue = Array.isArray(value) ? value[0] : value;
    penSizeRefLocal.current = nextValue;
    if (penSizeRafRef.current === null) {
      penSizeRafRef.current = requestAnimationFrame(() => {
        setDisplayPenSize(penSizeRefLocal.current);
        penSizeRafRef.current = null;
      });
    }
  };

  const handlePenSizeChangeCommitted = () => {
    onPenSizeChange(penSizeRefLocal.current);
  };

  const handleComponentColorOpen = (event: React.MouseEvent<HTMLElement>) => {
    setComponentColorAnchor(event.currentTarget);
  };
  
  const handleComponentColorClose = () => {
    setComponentColorAnchor(null);
  };
  
  const handleComponentColorChange = (color: string) => {
    onComponentColorChange(color, Date.now());
  };
  
  const handlePenColorOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPenColorAnchor(event.currentTarget);
  };
  
  const handlePenColorClose = () => {
    setPenColorAnchor(null);
  };
  
  const handleCanvasColorOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCanvasColorAnchor(event.currentTarget);
  };
  
  const handleCanvasColorClose = () => {
    setCanvasColorAnchor(null);
  };
  
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
            <Tooltip
              title="Cursor Mode - Select and move components"
              slotProps={tooltipSlotProps}
            >
              <IconButton
                color={isCursorMode ? "primary" : "default"}
                onClick={onCursorMode}
                size="small"
              >
                <CursorIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Drawing Tools
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Tooltip title="Pen Tool" slotProps={tooltipSlotProps}>
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

            <Tooltip title="Eraser Tool" slotProps={tooltipSlotProps}>
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

            <Tooltip
              title="Magic Wand - Draw shapes to create components"
              slotProps={tooltipSlotProps}
            >
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
              variant={resizeMode === "match" ? "contained" : "outlined"}
              onClick={() => onResizeModeChange("match")}
              sx={{ fontSize: "0.75rem" }}
            >
              Match
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
            Brush Size: {displayPenSize}px
          </Typography>
          <Slider
            value={displayPenSize}
            onChange={handlePenSizeChange}
            onChangeCommitted={handlePenSizeChangeCommitted}
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
            <ColorIcon sx={{ color: "#1976d2" }} />
            <Button
              variant="outlined"
              onClick={handlePenColorOpen}
              sx={{
                width: 60,
                height: 30,
                minWidth: 60,
                padding: 0,
                backgroundColor: penColor,
                border: "1px solid #ccc",
                "&:hover": {
                  backgroundColor: penColor,
                  border: "1px solid #999",
                },
              }}
            />
            <Popover
              open={Boolean(penColorAnchor)}
              anchorEl={penColorAnchor}
              onClose={handlePenColorClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <ColorPicker
                currentColor={penColor}
                onColorChange={onPenColorChange}
                onClose={handlePenColorClose}
              />
            </Popover>
            {penColor !== "#1976d2" && (
              <Tooltip title="Reset to default" slotProps={tooltipSlotProps}>
                <IconButton
                  size="small"
                  onClick={() => onPenColorChange("#1976d2")}
                  sx={{ padding: 0.5 }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Component Color
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ColorIcon sx={{ color: "#1976d2" }} />
            <Button
              variant="outlined"
              onClick={handleComponentColorOpen}
              sx={{
                width: 60,
                height: 30,
                minWidth: 60,
                padding: 0,
                backgroundColor: componentColor,
                border: "1px solid #ccc",
                "&:hover": {
                  backgroundColor: componentColor,
                  border: "1px solid #999",
                },
              }}
            />
            <Popover
              open={Boolean(componentColorAnchor)}
              anchorEl={componentColorAnchor}
              onClose={handleComponentColorClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <ColorPicker
                currentColor={componentColor}
                onColorChange={handleComponentColorChange}
                onClose={handleComponentColorClose}
              />
            </Popover>
            {componentColor !== "#1976d2" && (
              <Tooltip title="Reset to default" slotProps={tooltipSlotProps}>
                <IconButton
                  size="small"
                  onClick={() => onComponentColorChange("#1976d2", Date.now())}
                  sx={{ padding: 0.5 }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Canvas Color
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ColorIcon sx={{ color: "#1976d2" }} />
            <Button
              variant="outlined"
              onClick={handleCanvasColorOpen}
              sx={{
                width: 60,
                height: 30,
                minWidth: 60,
                padding: 0,
                backgroundColor: canvasColor,
                border: "1px solid #ccc",
                "&:hover": {
                  backgroundColor: canvasColor,
                  border: "1px solid #999",
                },
              }}
            />
            <Popover
              open={Boolean(canvasColorAnchor)}
              anchorEl={canvasColorAnchor}
              onClose={handleCanvasColorClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <ColorPicker
                currentColor={canvasColor}
                onColorChange={onCanvasColorChange}
                onClose={handleCanvasColorClose}
              />
            </Popover>
            {canvasColor !== "#ffffff" && (
              <Tooltip title="Reset to default" slotProps={tooltipSlotProps}>
                <IconButton
                  size="small"
                  onClick={() => onCanvasColorChange("#ffffff")}
                  sx={{ padding: 0.5 }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GridIcon />
            <Typography variant="body2" color="text.secondary">
              Snap to Grid
            </Typography>
            <Switch
              checked={snapToGrid}
              onChange={(e) => onSnapToGridToggle(e.target.checked)}
              size="small"
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
            checked={isBrowserUIEnabled}
            onChange={(e) => onBrowserUIEnabledToggle(e.target.checked)}
            size="small"
          />
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={showTitleBar}
              onChange={(e) => onTitleBarToggle(e.target.checked)}
              disabled={!isBrowserUIEnabled}
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
              disabled={!isBrowserUIEnabled}
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
              disabled={!isBrowserUIEnabled}
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
              disabled={!isBrowserUIEnabled}
              size="small"
            />
          }
          label="macOS Style"
        />
      </Box>
    </Paper>
  );
}
