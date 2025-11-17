import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  Paper,
  Popover,
  Slider,
  SpeedDial,
  SpeedDialAction,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Palette as PaletteIcon } from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";
import type { CanvasComponent } from "../types/component";
import ColorPicker from "./ColorPicker";

interface ComponentRendererProps {
  component: CanvasComponent;
  onMouseDown: (e: React.MouseEvent, componentId: string, resizeDirection?: string) => void;
  onComponentUpdate?: (componentId: string, props: Partial<CanvasComponent["props"]>) => void;
  onComponentColorChange?: (componentId: string, color: string) => void;
  isDragging?: boolean;
  isSelected?: boolean;
}

export default function ComponentRenderer({
  component,
  onMouseDown,
  onComponentUpdate,
  onComponentColorChange,
  isDragging = false,
  isSelected = false,
}: ComponentRendererProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isInteractingWithSliderRef = useRef(false);
  const sliderValueRef = useRef<number>(
    (component.props?.value as number) ?? 50,
  );
  const sliderAnimationFrameRef = useRef<number | null>(null);
  const [sliderDisplayValue, setSliderDisplayValue] = useState(
    sliderValueRef.current,
  );
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [speedDialAnchor, setSpeedDialAnchor] = useState<{ x: number; y: number } | null>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const propValue = (component.props?.value as number) ?? 50;
    sliderValueRef.current = propValue;
    setSliderDisplayValue(propValue);
  }, [component.props?.value]);

  useEffect(() => {
    return () => {
      if (sliderAnimationFrameRef.current !== null) {
        cancelAnimationFrame(sliderAnimationFrameRef.current);
      }
    };
  }, []);

  const scheduleSliderRenderUpdate = () => {
    if (sliderAnimationFrameRef.current === null) {
      sliderAnimationFrameRef.current = requestAnimationFrame(() => {
        setSliderDisplayValue(sliderValueRef.current);
        sliderAnimationFrameRef.current = null;
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start dragging if clicking on interactive elements like Slider
    const target = e.target as HTMLElement;
    if (
      target.closest(".MuiSlider-root") ||
      target.closest(".MuiSlider-thumb") ||
      target.closest(".MuiSlider-track") ||
      target.closest(".MuiSlider-rail")
    ) {
      e.stopPropagation();
      isInteractingWithSliderRef.current = true;
      return;
    }
    
    // Don't start dragging if we're currently interacting with slider
    if (isInteractingWithSliderRef.current) {
      e.stopPropagation();
      return;
    }
    
    e.stopPropagation();
    const resizeDirection = (e.target as HTMLElement)?.dataset?.resize;
    onMouseDown(e, component.id, resizeDirection);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // Prevent mouse up from resize handles from propagating to overlay
    const resizeDirection = (e.target as HTMLElement)?.dataset?.resize;
    if (resizeDirection) {
      e.stopPropagation();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setSpeedDialAnchor({ x: rect.right, y: rect.top + rect.height / 2 });
    setSpeedDialOpen(true);
  };

  const handleSpeedDialClose = (event: React.SyntheticEvent, reason?: string) => {
    // Don't close if the reason is mouseLeave and the mouse is over a tooltip
    if (reason === "mouseLeave") {
      const target = event.target as HTMLElement;
      const relatedTarget = (event.nativeEvent as MouseEvent).relatedTarget as HTMLElement | null;
      
      // Check if we're moving to a tooltip or tooltip-related element
      if (relatedTarget) {
        const isMovingToTooltip = 
          relatedTarget.closest(".MuiTooltip-root") !== null ||
          relatedTarget.closest(".MuiTooltip-popper") !== null ||
          relatedTarget.closest(".MuiTooltip-tooltip") !== null ||
          relatedTarget.classList.contains("MuiTooltip-tooltip") ||
          relatedTarget.closest(".MuiSpeedDialAction-staticTooltipLabel") !== null ||
          relatedTarget.classList.contains("MuiSpeedDialAction-staticTooltipLabel");
        
        if (isMovingToTooltip) {
          return; // Don't close
        }
      }
    }
    
    setSpeedDialOpen(false);
    setSpeedDialAnchor(null);
  };

  const handleEditColor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeedDialOpen(false);
    setSpeedDialAnchor(null);
    setColorPickerAnchor(e.currentTarget as HTMLElement);
  };

  const handleColorPickerClose = () => {
    setColorPickerAnchor(null);
  };

  const handleColorChange = (color: string) => {
    if (onComponentColorChange) {
      onComponentColorChange(component.id, color);
    }
  };
  
  const handleSliderMouseDown = (e: React.MouseEvent) => {
    // Stop all propagation for slider interactions
    e.stopPropagation();
    isInteractingWithSliderRef.current = true;
  };
  
  const handleSliderMouseMove = (e: React.MouseEvent) => {
    // Stop propagation during slider dragging
    e.stopPropagation();
  };
  
  const handleSliderMouseUp = (e: React.MouseEvent) => {
    // Stop propagation when releasing slider
    e.stopPropagation();
    // Reset after a short delay to allow slider to finish its interaction
    setTimeout(() => {
      isInteractingWithSliderRef.current = false;
    }, 100);
  };
  
  const handleSliderChange = (
    _event: Event,
    value: number | number[],
  ) => {
    const numericValue = Array.isArray(value) ? value[0] : value;
    sliderValueRef.current = numericValue;
    isInteractingWithSliderRef.current = true;
    scheduleSliderRenderUpdate();
  };

  const handleSliderChangeCommitted = (
    _event: Event,
    value: number | number[],
  ) => {
    const numericValue = Array.isArray(value) ? value[0] : value;
    sliderValueRef.current = numericValue;
    scheduleSliderRenderUpdate();
    if (onComponentUpdate) {
      onComponentUpdate(component.id, { value: sliderValueRef.current });
    }
    setTimeout(() => {
      isInteractingWithSliderRef.current = false;
    }, 100);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only allow editing for components that have text
    const hasText = ["Button", "Card", "Typography", "Avatar", "Paper", "Box"].includes(component.type);
    if (hasText && onComponentUpdate) {
      const currentText = (component.props?.text as string) || "";
      setEditValue(currentText);
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    if (onComponentUpdate && isEditing) {
      onComponentUpdate(component.id, { text: editValue });
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (onComponentUpdate) {
        onComponentUpdate(component.id, { text: editValue });
        setIsEditing(false);
      }
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue((component.props?.text as string) || "");
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Helper function to check if element is within SpeedDial area
  const isWithinSpeedDialArea = (target: HTMLElement | null): boolean => {
    if (!target) return false;
    return (
      target.closest(".MuiSpeedDial-root") !== null ||
      target.closest(".MuiPopover-root") !== null ||
      target.closest(".MuiTooltip-root") !== null ||
      target.closest(".MuiTooltip-popper") !== null ||
      target.closest("[role='tooltip']") !== null ||
      target.classList.contains("MuiTooltip-tooltip") ||
      target.closest(".MuiTooltip-tooltip") !== null ||
      target.classList.contains("MuiSpeedDialAction-staticTooltipLabel") ||
      target.closest(".MuiSpeedDialAction-staticTooltipLabel") !== null ||
      target.closest(".MuiSpeedDialAction-fab") !== null ||
      target.closest(".MuiFab-root") !== null
    );
  };

  // Close SpeedDial when clicking outside or pressing escape
  useEffect(() => {
    if (!speedDialOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!isWithinSpeedDialArea(target)) {
        setSpeedDialOpen(false);
        setSpeedDialAnchor(null);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && speedDialOpen) {
        e.preventDefault();
        e.stopPropagation();
        setSpeedDialOpen(false);
        setSpeedDialAnchor(null);
      }
    };

    // Also add mouseenter/mouseleave handlers to tooltip elements to keep menu open
    const handleTooltipMouseEnter = () => {
      // Keep menu open when mouse enters tooltip area
    };

    const handleTooltipMouseLeave = () => {
      // Keep menu open when mouse leaves tooltip area
    };

    // Add a small delay to prevent immediate closure from the right-click event
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside, true);
      document.addEventListener("contextmenu", handleClickOutside, true);
      document.addEventListener("keydown", handleEscape, true);
      
      // Attach to tooltip elements if they exist
      const tooltipElements = document.querySelectorAll(".MuiTooltip-root, .MuiTooltip-popper, .MuiSpeedDialAction-staticTooltipLabel");
      tooltipElements.forEach((el) => {
        el.addEventListener("mouseenter", handleTooltipMouseEnter);
        el.addEventListener("mouseleave", handleTooltipMouseLeave);
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside, true);
      document.removeEventListener("contextmenu", handleClickOutside, true);
      document.removeEventListener("keydown", handleEscape, true);
      
      const tooltipElements = document.querySelectorAll(".MuiTooltip-root, .MuiTooltip-popper, .MuiSpeedDialAction-staticTooltipLabel");
      tooltipElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleTooltipMouseEnter);
        el.removeEventListener("mouseleave", handleTooltipMouseLeave);
      });
    };
  }, [speedDialOpen]);

  const componentWidth = component.width;
  const componentHeight = component.height;

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    left: component.x,
    top: component.y,
    cursor: isDragging ? "grabbing" : "grab",
    userSelect: "none",
    zIndex: 10,
    pointerEvents: "auto",
    width: componentWidth ? `${componentWidth}px` : "auto",
    height: componentHeight ? `${componentHeight}px` : "auto",
  };

  const resizeHandleBaseStyle: React.CSSProperties = {
    position: "absolute",
    width: 8,
    height: 8,
    backgroundColor: "#1976d2",
    border: "1px solid #fff",
    borderRadius: "50%",
    zIndex: 11,
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
  };

  // Corner handles (diagonal resize)
  const topLeftHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyle,
    top: -4,
    left: -4,
    cursor: "nw-resize",
  };

  const topRightHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyle,
    top: -4,
    right: -4,
    cursor: "ne-resize",
  };

  const bottomLeftHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyle,
    bottom: -4,
    left: -4,
    cursor: "sw-resize",
  };

  const bottomRightHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyle,
    bottom: -4,
    right: -4,
    cursor: "se-resize",
  };

  // Edge handles (single direction resize)
  const topHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyle,
    top: -4,
    left: "50%",
    transform: "translateX(-50%)",
    cursor: "n-resize",
  };

  const rightHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyle,
    right: -4,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "e-resize",
  };

  const bottomHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyle,
    bottom: -4,
    left: "50%",
    transform: "translateX(-50%)",
    cursor: "s-resize",
  };

  const leftHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyle,
    left: -4,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "w-resize",
  };

  // Helper function to determine if a color is dark (for text contrast)
  const isDarkColor = (color: string): boolean => {
    // Convert hex to RGB
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  // Helper to get text color for filled components
  const getTextColorForFilled = (bgColor: string): string => {
    return isDarkColor(bgColor) ? "#ffffff" : "#000000";
  };

  const renderComponent = () => {
    const widthProps = componentWidth ? { sx: { width: "100%" } } : {};
    const heightProps = componentHeight ? { sx: { height: "100%" } } : {};
    const centeredAlignment = { sx: { textAlign: "center" as const } };
    const componentColor = component.color || "#1976d2";

    switch (component.type) {
      case "Button": {
        const { sx: propsSx, ...otherProps } = (component.props || {}) as {
          sx?: unknown;
          [key: string]: unknown;
        };
        return (
          <Button
            variant="contained"
            {...otherProps}
            sx={{
              ...(widthProps.sx || {}),
              ...(heightProps.sx || {}),
              ...(centeredAlignment.sx || {}),
              backgroundColor: componentColor,
              color: getTextColorForFilled(componentColor),
              "&:hover": { backgroundColor: componentColor },
              textTransform: "none",
              ...((propsSx as object) || {}),
            }}
          >
            {(component.props?.text as string) || "Button"}
          </Button>
        );
      }
      case "TextField":
        return (
          <TextField
            label={(component.props?.label as string) || "Text Field"}
            size="small"
            {...(component.props as object)}
            {...widthProps}
            sx={{
              ...(widthProps.sx || {}),
              "& input": { textAlign: "center", color: componentColor },
              "& label": { color: componentColor },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: componentColor },
                "&:hover fieldset": { borderColor: componentColor },
                "&.Mui-focused fieldset": { borderColor: componentColor },
              },
            }}
          />
        );
      case "Card":
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
              <Typography variant="body2" sx={{ color: componentColor }}>
                {(component.props?.text as string) || "Card Content"}
              </Typography>
            </CardContent>
          </Card>
        );
      case "Typography":
        return (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
            <Typography
              variant="body1"
              {...(component.props as object)}
              {...widthProps}
              {...centeredAlignment}
              sx={{
                ...(widthProps.sx || {}),
                ...(centeredAlignment.sx || {}),
                color: componentColor,
              }}
            >
              {(component.props?.text as string) || "Typography"}
            </Typography>
          </Box>
        );
      case "Checkbox":
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
            <Checkbox
              {...(component.props as object)}
              defaultChecked={component.props?.checked as boolean}
              sx={{ 
                color: isDarkColor(componentColor) ? componentColor : "#000000",
                "&.Mui-checked": { 
                  color: isDarkColor(componentColor) ? componentColor : "#000000",
                },
                "& .MuiSvgIcon-root": {
                  color: isDarkColor(componentColor) ? componentColor : "#000000",
                },
                "&.Mui-checked .MuiSvgIcon-root": {
                  color: isDarkColor(componentColor) ? componentColor : "#000000",
                },
              }}
            />
          </Box>
        );
      case "Switch":
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
            <Switch
              {...(component.props as object)}
              defaultChecked={component.props?.checked as boolean}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: componentColor },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { 
                  backgroundColor: componentColor,
                  ...(isDarkColor(componentColor) ? {} : {
                    boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.2)",
                  }),
                },
                "& .MuiSwitch-thumb": {
                  ...(isDarkColor(componentColor) ? {} : {
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                  }),
                },
              }}
            />
          </Box>
        );
      case "Slider":
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              px: 2,
            }}
          >
            <Slider
              {...(component.props as object)}
              value={sliderDisplayValue}
              onMouseDown={handleSliderMouseDown}
              onMouseMove={handleSliderMouseMove}
              onMouseUp={handleSliderMouseUp}
              onChange={handleSliderChange}
              onChangeCommitted={handleSliderChangeCommitted}
              sx={{ 
                width: "100%", 
                color: componentColor,
                "& .MuiSlider-thumb": {
                  ...(isDarkColor(componentColor) ? {} : {
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                  }),
                },
                "& .MuiSlider-track": {
                  ...(isDarkColor(componentColor) ? {} : {
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                  }),
                },
                "& .MuiSlider-rail": {
                  ...(isDarkColor(componentColor) ? {} : {
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                  }),
                },
              }}
            />
          </Box>
        );
      case "Chip":
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
            <Chip
              {...(component.props as object)}
              label={(component.props?.label as string) || "Chip"}
              sx={{
                backgroundColor: componentColor,
                color: getTextColorForFilled(componentColor),
              }}
            />
          </Box>
        );
      case "Avatar":
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
            <Avatar
              {...(component.props as object)}
              sx={{
                width: Math.min(componentWidth || 40, componentHeight || 40),
                height: Math.min(componentWidth || 40, componentHeight || 40),
                bgcolor: componentColor,
                color: getTextColorForFilled(componentColor),
              }}
            >
              {(component.props?.text as string) || "A"}
            </Avatar>
          </Box>
        );
      case "Divider":
        const isVertical =
          componentHeight &&
          componentWidth &&
          componentHeight > componentWidth;
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <Divider
              {...(component.props as object)}
              orientation={isVertical ? "vertical" : "horizontal"}
              sx={{
                width: "100%",
                borderColor: componentColor,
                ...(isVertical
                  ? { borderLeftWidth: "2px" }
                  : { borderTopWidth: "2px" }),
              }}
            />
          </Box>
        );
      case "Paper":
        return (
          <Paper
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: componentColor,
              ...centeredAlignment.sx,
            }}
            {...(component.props as object)}
          >
            <Typography
              variant="body2"
              sx={{ color: getTextColorForFilled(componentColor) }}
            >
              {(component.props?.text as string) || "Paper"}
            </Typography>
          </Paper>
        );
      case "Box":
        return (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed",
              borderColor: componentColor,
              backgroundColor: `${componentColor}20`,
              ...centeredAlignment.sx,
            }}
            {...(component.props as object)}
          >
            <Typography variant="body2">
              {(component.props?.text as string) || "Box"}
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  const renderEditableInput = () => {
    if (!isEditing) return null;
    
    const componentColor = component.color || "#1976d2";
    const isFilled = ["Button", "Paper", "Avatar", "Chip"].includes(component.type);
    const textColor = isFilled ? getTextColorForFilled(componentColor) : componentColor;
    
    return (
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
          backgroundColor: isFilled ? componentColor : "transparent",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            background: "transparent",
            border: "2px solid #1976d2",
            borderRadius: "4px",
            padding: "4px 8px",
            color: textColor,
            fontSize: "14px",
            width: "80%",
            textAlign: "center",
            outline: "none",
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </Box>
    );
  };

  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Draggable container wrapper */}
      <div
        style={containerStyle}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {renderComponent()}
        {renderEditableInput()}
        {isSelected && (
          <>
            {/* Corner handles */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: Resize handle */}
            <div style={topLeftHandleStyle} onMouseDown={handleMouseDown} data-resize="nw" />
            {/* biome-ignore lint/a11y/noStaticElementInteractions: Resize handle */}
            <div style={topRightHandleStyle} onMouseDown={handleMouseDown} data-resize="ne" />
            {/* biome-ignore lint/a11y/noStaticElementInteractions: Resize handle */}
            <div style={bottomLeftHandleStyle} onMouseDown={handleMouseDown} data-resize="sw" />
            {/* biome-ignore lint/a11y/noStaticElementInteractions: Resize handle */}
            <div style={bottomRightHandleStyle} onMouseDown={handleMouseDown} data-resize="se" />
            {/* Edge handles */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: Resize handle */}
            <div style={topHandleStyle} onMouseDown={handleMouseDown} data-resize="n" />
            {/* biome-ignore lint/a11y/noStaticElementInteractions: Resize handle */}
            <div style={rightHandleStyle} onMouseDown={handleMouseDown} data-resize="e" />
            {/* biome-ignore lint/a11y/noStaticElementInteractions: Resize handle */}
            <div style={bottomHandleStyle} onMouseDown={handleMouseDown} data-resize="s" />
            {/* biome-ignore lint/a11y/noStaticElementInteractions: Resize handle */}
            <div style={leftHandleStyle} onMouseDown={handleMouseDown} data-resize="w" />
          </>
        )}
      </div>

      {/* Speed Dial for right-click menu */}
      {speedDialAnchor && (
        <Box
          sx={{
            position: "fixed",
            left: speedDialAnchor.x,
            top: speedDialAnchor.y,
            transform: "translateY(-50%)",
            zIndex: 1500,
            "& .MuiSpeedDialAction-staticTooltipLabel": {
              pointerEvents: "auto",
              userSelect: "none",
              cursor: "pointer",
            },
            "& .MuiTooltip-root": {
              pointerEvents: "auto",
            },
            "& .MuiTooltip-tooltip": {
              userSelect: "none",
              cursor: "pointer",
            },
          }}
          onMouseEnter={(e) => {
            // Prevent closing when hovering over SpeedDial area
            e.stopPropagation();
          }}
          onMouseLeave={(e) => {
            // Don't close on mouse leave - let it stay open
            // Only close on explicit clicks outside or escape key
            e.stopPropagation();
          }}
        >
          <SpeedDial
            ariaLabel="Component actions"
            icon={null}
            open={speedDialOpen}
            onClose={(event, reason) => {
              // Only close on backdrop click, not on mouse leave or escape (handled separately)
              if (reason === "backdropClick") {
                handleSpeedDialClose(event, reason);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            direction="down"
            FabProps={{
              sx: {
                width: 0,
                height: 0,
                minHeight: 0,
                minWidth: 0,
                padding: 0,
                opacity: 0,
                pointerEvents: "none",
                boxShadow: "none",
              },
            }}
          >
            <SpeedDialAction
              key="edit-color"
              icon={<PaletteIcon />}
              tooltipTitle="Edit Color"
              tooltipOpen
              tooltipPlacement="right"
              onClick={handleEditColor}
              onMouseEnter={(e) => {
                // Keep menu open when hovering over button
                e.stopPropagation();
              }}
              onMouseLeave={(e) => {
                // Keep menu open when unhovering from button
                // Don't close, just stop propagation
                e.stopPropagation();
              }}
            />
          </SpeedDial>
        </Box>
      )}

      {/* Color Picker Popover */}
      <Popover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor}
        onClose={handleColorPickerClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ColorPicker
          currentColor={component.color || "#1976d2"}
          onColorChange={handleColorChange}
          onClose={handleColorPickerClose}
        />
      </Popover>
    </>
  );
}
