import {
  NearMe as CursorIcon,
  Gesture as GestureIcon,
  GridOn as GridIcon,
  AutoFixHigh as MagicWandIcon,
  Edit as PenIcon,
  TextFields as TextIcon,
  Web as WebIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonGroup,
  FormControlLabel,
  IconButton,
  Paper,
  Slider,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useSelectedComponentIds } from "../../stores/canvasStore";
import ColorSection from "../color/ColorSection";
import { usePenSizeSetter, usePenSizeValue } from "../../stores/canvasStore";

interface ToolsDrawerProps {
  penColor: string;
  onPenColorChange: (color: string) => void;
  componentColor: string;
  onComponentColorChange: (color: string, timestamp?: number) => void;
  canvasColor: string;
  onCanvasColorChange: (color: string) => void;
  isDrawing: boolean;
  onDrawingToggle: (drawing: boolean) => void;
  snapToGrid: boolean;
  onSnapToGridToggle: (snap: boolean) => void;
  isEraser: boolean;
  onEraserToggle: (eraser: boolean) => void;
  isMagicWand: boolean;
  onMagicWandToggle: (magicWand: boolean) => void;
  isLasso: boolean;
  onLassoToggle: (enabled: boolean) => void;
  onCursorMode: () => void;
  isCursorMode: boolean;
  isTextSelectMode: boolean;
  onTextSelectToggle: (enabled: boolean) => void;
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

export default function ToolsDrawer({
  penColor,
  onPenColorChange,
  componentColor,
  onComponentColorChange,
  canvasColor,
  onCanvasColorChange,
  isDrawing,
  onDrawingToggle,
  snapToGrid,
  onSnapToGridToggle,
  isEraser,
  onEraserToggle,
  isMagicWand,
  onMagicWandToggle,
  isLasso,
  onLassoToggle,
  onCursorMode,
  isCursorMode,
  isTextSelectMode,
  onTextSelectToggle,
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
}: ToolsDrawerProps) {
  const selectedComponentIds = useSelectedComponentIds();
  const tooltipSlotProps = { tooltip: { sx: { fontSize: "0.85rem" } } };

  // Brush size slider refs/state for performant updates
  const penSize = usePenSizeValue();
  const setPenSize = usePenSizeSetter();
  const [displayPenSize, setDisplayPenSize] = useState(penSize);
  const penSizeRefLocal = useRef(penSize);
  const penSizeRafRef = useRef<number | null>(null);
  const storeUpdateRafRef = useRef<number | null>(null);

  useEffect(() => {
    penSizeRefLocal.current = penSize;
    setDisplayPenSize(penSize);
  }, [penSize]);

  useEffect(() => {
    return () => {
      if (penSizeRafRef.current !== null) {
        cancelAnimationFrame(penSizeRafRef.current);
      }
      if (storeUpdateRafRef.current !== null) {
        cancelAnimationFrame(storeUpdateRafRef.current);
      }
    };
  }, []);

  const handlePenSizeChange = (_: Event, value: number | number[]) => {
    const nextValue = Array.isArray(value) ? value[0] : value;
    penSizeRefLocal.current = nextValue;
    setDisplayPenSize((prev) => (prev === nextValue ? prev : nextValue));
    if (penSizeRafRef.current === null) {
      penSizeRafRef.current = requestAnimationFrame(() => {
        setDisplayPenSize(penSizeRefLocal.current);
        penSizeRafRef.current = null;
      });
    }
    if (storeUpdateRafRef.current === null) {
      storeUpdateRafRef.current = requestAnimationFrame(() => {
        setPenSize(penSizeRefLocal.current);
        storeUpdateRafRef.current = null;
      });
    }
  };

  const handlePenSizeChangeCommitted = () => {
    if (storeUpdateRafRef.current !== null) {
      cancelAnimationFrame(storeUpdateRafRef.current);
      storeUpdateRafRef.current = null;
    }
    setPenSize(penSizeRefLocal.current);
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
                onClick={() => {
                  onCursorMode();
                  onLassoToggle(false);
                }}
                size="small"
              >
                <CursorIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Lasso Select" slotProps={tooltipSlotProps}>
              <IconButton
                color={isLasso ? "primary" : "default"}
                onClick={() => {
                  const next = !isLasso;
                  onLassoToggle(next);
                  if (next) {
                    onDrawingToggle(false);
                    onEraserToggle(false);
                    onMagicWandToggle(false);
                    onTextSelectToggle(false);
                  }
                }}
                size="small"
              >
                <GestureIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Text Select" slotProps={tooltipSlotProps}>
              <IconButton
                color={isTextSelectMode ? "primary" : "default"}
                onClick={() => onTextSelectToggle(!isTextSelectMode)}
                size="small"
              >
                <TextIcon />
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
                    onLassoToggle(false);
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
                    onLassoToggle(false);
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

        <ColorSection
          label="Brush Color"
          color={penColor}
          onColorChange={onPenColorChange}
          defaultColor="#1976d2"
        />

        <ColorSection
          label="Component Color"
          color={componentColor}
          onColorChange={onComponentColorChange}
          defaultColor="#1976d2"
          selectedComponentIds={selectedComponentIds}
        />

        <ColorSection
          label="Canvas Color"
          color={canvasColor}
          onColorChange={onCanvasColorChange}
          defaultColor="#ffffff"
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GridIcon />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                cursor: "pointer",
                userSelect: "none",
                "&:hover": {
                  color: "text.primary",
                },
              }}
              onClick={() => onSnapToGridToggle(!snapToGrid)}
            >
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
