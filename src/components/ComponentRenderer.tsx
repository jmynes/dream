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
  Radio,
  RadioGroup,
  FormControlLabel,
  Slider,
  SpeedDial,
  SpeedDialAction,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  EditNote as EditNoteIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";
import type { CanvasComponent } from "../types/component";
import ColorPicker from "./ColorPicker";

interface ComponentRendererProps {
  component: CanvasComponent;
  onMouseDown: (e: React.MouseEvent, componentId: string, resizeDirection?: string) => void;
  onComponentUpdate?: (componentId: string, props: Partial<CanvasComponent["props"]>) => void;
  onComponentColorChange?: (componentId: string, color: string) => void;
  onComponentDelete?: (componentId: string) => void;
  onComponentCopy?: (component: CanvasComponent) => void;
  isDragging?: boolean;
  isSelected?: boolean;
  isTextSelectMode?: boolean;
}

export default function ComponentRenderer({
  component,
  onMouseDown,
  onComponentUpdate,
  onComponentColorChange,
  onComponentDelete,
  onComponentCopy,
  isDragging = false,
  isSelected = false,
  isTextSelectMode = false,
}: ComponentRendererProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null); // Track which field is being edited (e.g., "radio1", "radio2", "header1", "cell1_1", etc.)
  const inputRef = useRef<HTMLInputElement>(null);
  const textWidthRef = useRef<number>(0); // Store original text width to prevent expansion
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
    if (isTextSelectMode) {
      e.stopPropagation();
      return;
    }
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComponentDelete) {
      onComponentDelete(component.id);
    }
    setSpeedDialOpen(false);
    setSpeedDialAnchor(null);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComponentCopy) {
      onComponentCopy(component);
    }
    setSpeedDialOpen(false);
    setSpeedDialAnchor(null);
  };

  const handleEditText = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeedDialOpen(false);
    setSpeedDialAnchor(null);
    // Trigger text editing mode (same as double-click)
    const hasText = ["Button", "Card", "Typography", "Avatar", "Paper", "Box", "Radio", "Table", "TextField", "Chip", "Checkbox"].includes(component.type);
    if (hasText && onComponentUpdate) {
      let currentText = "";
      let field = "";
      
      if (component.type === "Radio") {
        field = "radio1";
        currentText = (component.props?.label as string) || "Option 1";
      } else if (component.type === "Table") {
        field = "header1";
        currentText = (component.props?.header1 as string) || "Header 1";
      } else if (component.type === "TextField") {
        field = "value";
        currentText = (component.props?.value as string) || "";
      } else if (component.type === "Chip") {
        field = "label";
        currentText = (component.props?.label as string) || "Chip";
      } else if (component.type === "Checkbox") {
        field = "label";
        currentText = (component.props?.label as string) || "Checkbox";
      } else {
        field = "text";
        currentText = (component.props?.text as string) || "";
      }
      
      setEditingField(field);
      setEditValue(currentText);
      setIsEditing(true);
    }
  };

  const canEditText = ["Button", "Card", "Typography", "Avatar", "Paper", "Box", "TextField", "Chip", "Radio", "Table", "Checkbox"].includes(component.type);

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

  const triggerInlineEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only allow editing for components that have text
    const hasText = ["Button", "Card", "Typography", "Avatar", "Paper", "Box", "Radio", "Table", "TextField", "Chip", "Checkbox"].includes(component.type);
    if (hasText && onComponentUpdate) {
      let currentText = "";
      let field = "";
      
      // Check if clicking on a specific field (radio option or table cell)
      const target = e.target as HTMLElement;
      const dataField = target.getAttribute("data-field") || target.closest("[data-field]")?.getAttribute("data-field");
      
      // Store the width of the text element before editing (to prevent expansion)
      if (component.type === "Chip") {
        // Find the Chip label element
        const chipLabel = target.closest(".MuiChip-label, [class*='MuiChip']");
        if (chipLabel) {
          const computedStyle = window.getComputedStyle(chipLabel as Element);
          // Create a temporary span to measure text width
          const tempSpan = document.createElement("span");
          tempSpan.style.visibility = "hidden";
          tempSpan.style.position = "absolute";
          tempSpan.style.whiteSpace = "nowrap";
          tempSpan.style.fontSize = computedStyle.fontSize;
          tempSpan.style.fontFamily = computedStyle.fontFamily;
          tempSpan.style.fontWeight = computedStyle.fontWeight;
          tempSpan.textContent = (component.props?.label as string) || "Chip";
          document.body.appendChild(tempSpan);
          textWidthRef.current = tempSpan.offsetWidth;
          document.body.removeChild(tempSpan);
        } else {
          // Fallback: measure using a simple calculation
          const labelText = (component.props?.label as string) || "Chip";
          textWidthRef.current = labelText.length * 8; // Rough estimate: 8px per character
        }
      } else {
        textWidthRef.current = 0;
      }
      
      if (component.type === "Radio") {
        if (dataField === "radio2") {
          field = "radio2";
          currentText = (component.props?.label2 as string) || "Option 2";
        } else {
          field = "radio1";
          currentText = (component.props?.label as string) || "Option 1";
        }
      } else if (component.type === "Table") {
        if (dataField) {
          field = dataField;
          // Get the current value for the specific field
          const fieldMap: Record<string, string> = {
            header1: (component.props?.header1 as string) || "Header 1",
            header2: (component.props?.header2 as string) || "Header 2",
            header3: (component.props?.header3 as string) || "Header 3",
            cell1_1: (component.props?.cell1_1 as string) || "Cell 1-1",
            cell1_2: (component.props?.cell1_2 as string) || "Cell 1-2",
            cell1_3: (component.props?.cell1_3 as string) || "Cell 1-3",
            cell2_1: (component.props?.cell2_1 as string) || "Cell 2-1",
            cell2_2: (component.props?.cell2_2 as string) || "Cell 2-2",
            cell2_3: (component.props?.cell2_3 as string) || "Cell 2-3",
          };
          currentText = fieldMap[dataField] || "";
        } else {
          // Default to first header if no field specified
          field = "header1";
          currentText = (component.props?.header1 as string) || "Header 1";
        }
      } else if (component.type === "TextField") {
        field = "value";
        currentText = (component.props?.value as string) || "";
      } else if (component.type === "Chip") {
        field = "label";
        currentText = (component.props?.label as string) || "Chip";
      } else if (component.type === "Checkbox") {
        field = "label";
        currentText = (component.props?.label as string) || "Checkbox";
      } else {
        field = "text";
        currentText = (component.props?.text as string) || "";
      }
      
      setEditingField(field);
      setEditValue(currentText);
      setIsEditing(true);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    triggerInlineEdit(e);
  };

  const handleTextClick = (e: React.MouseEvent) => {
    if (!isTextSelectMode) {
      return;
    }
    triggerInlineEdit(e);
  };

  const handleBlur = () => {
    if (onComponentUpdate && isEditing && editingField) {
      const updateProps: Record<string, unknown> = {};
      
      if (component.type === "Radio") {
        if (editingField === "radio2") {
          updateProps.label2 = editValue;
        } else {
          updateProps.label = editValue;
        }
      } else if (component.type === "Table") {
        // Update the specific field that was edited
        updateProps[editingField] = editValue;
      } else if (component.type === "TextField") {
        updateProps.value = editValue;
      } else if (component.type === "Chip") {
        updateProps.label = editValue;
      } else if (component.type === "Checkbox") {
        updateProps.label = editValue;
      } else {
        updateProps.text = editValue;
      }
      
      onComponentUpdate(component.id, updateProps);
      setIsEditing(false);
      setEditingField(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditingField(null);
      setEditValue("");
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

// Shared inline input style to avoid layout shifts
const inlineInputStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  outline: "none",
  color: "inherit",
  fontSize: "inherit",
  fontFamily: "inherit",
  padding: 0,
  margin: 0,
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
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
            {isEditing && editingField === "text" ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                style={{ ...inlineInputStyle, textAlign: "center" }}
              />
            ) : (
              (component.props?.text as string) || "Button"
            )}
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
            value={
              isEditing && editingField === "value" ? editValue : (component.props?.value as string) || ""
            }
            sx={{
              ...(widthProps.sx || {}),
              "& input": { textAlign: "center", color: componentColor },
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
              {isEditing && editingField === "text" ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
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
              {isEditing && editingField === "text" ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  style={{ ...inlineInputStyle, textAlign: "center" }}
                />
              ) : (
                (component.props?.text as string) || "Typography"
              )}
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
            <FormControlLabel
              control={
                <Checkbox
                  {...(component.props as object)}
                  defaultChecked={component.props?.checked as boolean}
                  sx={{ 
                    color: componentColor,
                    "&.Mui-checked": { 
                      color: componentColor,
                    },
                    "& .MuiSvgIcon-root": {
                      color: componentColor,
                    },
                    "&.Mui-checked .MuiSvgIcon-root": {
                      color: componentColor,
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
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      ...inlineInputStyle,
                      minWidth: 0,
                    }}
                  />
                ) : (
                  <span
                    data-field="label"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      const currentText = (component.props?.label as string) || "Checkbox";
                      setEditingField("label");
                      setEditValue(currentText);
                      setIsEditing(true);
                    }}
                  >
                    {(component.props?.label as string) || "Checkbox"}
                  </span>
                )
              }
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
              label={
                isEditing && editingField === "label" ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    size={Math.max(editValue.length || 1, 4)}
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "inherit",
                      fontSize: "inherit",
                      fontFamily: "inherit",
                      padding: 0,
                      margin: 0,
                      width: isEditing && textWidthRef.current > 0 ? `${textWidthRef.current}px` : "auto",
                      minWidth: 0,
                      maxWidth: isEditing && textWidthRef.current > 0 ? `${textWidthRef.current * 2}px` : "none",
                    }}
                  />
                ) : (
                  (component.props?.label as string) || "Chip"
                )
              }
              sx={{
                backgroundColor: componentColor,
                color: getTextColorForFilled(componentColor),
                ...(isEditing && editingField === "label" && textWidthRef.current > 0 ? {
                  width: `${textWidthRef.current + 40}px`,
                  minWidth: `${textWidthRef.current + 40}px`,
                  maxWidth: `${textWidthRef.current * 3 + 40}px`,
                } : {}),
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
              {isEditing && editingField === "text" ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  style={{ ...inlineInputStyle, textAlign: "center" }}
                />
              ) : (
                (component.props?.text as string) || "A"
              )}
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
            {isEditing && editingField === "text" ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                style={{
                  ...inlineInputStyle,
                  textAlign: "center",
                  color: getTextColorForFilled(componentColor),
                }}
              />
            ) : (
              <Typography
                variant="body2"
                sx={{ color: getTextColorForFilled(componentColor) }}
              >
                {(component.props?.text as string) || "Paper"}
              </Typography>
            )}
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
            {isEditing && editingField === "text" ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                style={{ ...inlineInputStyle, textAlign: "center" }}
              />
            ) : (
              <Typography variant="body2">
                {(component.props?.text as string) || "Box"}
              </Typography>
            )}
          </Box>
        );
      case "Radio":
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
                      color: isDarkColor(componentColor) ? componentColor : "#000000",
                      "&.Mui-checked": {
                        color: componentColor,
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
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleBlur}
                      onKeyDown={handleKeyDown}
                      onClick={(e) => e.stopPropagation()}
                      size={Math.max(editValue.length || 1, 4)}
                      style={{
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
                      }}
                    />
                  ) : (
                    <span
                      data-field="radio1"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        const currentText = (component.props?.label as string) || "Option 1";
                        setEditingField("radio1");
                        setEditValue(currentText);
                        setIsEditing(true);
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
                      color: isDarkColor(componentColor) ? componentColor : "#000000",
                      "&.Mui-checked": {
                        color: componentColor,
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
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleBlur}
                      onKeyDown={handleKeyDown}
                      onClick={(e) => e.stopPropagation()}
                      size={Math.max(editValue.length || 1, 4)}
                      style={{
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
                      }}
                    />
                  ) : (
                    <span
                      data-field="radio2"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        const currentText = (component.props?.label2 as string) || "Option 2";
                        setEditingField("radio2");
                        setEditValue(currentText);
                        setIsEditing(true);
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
      case "Table":
        return (
          <TableContainer
            sx={{
              width: "100%",
              height: "100%",
              overflow: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Table size="small" sx={{ border: `1px solid ${componentColor}`, tableLayout: "fixed", width: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ borderColor: componentColor, fontWeight: "bold", textAlign: "center" }}
                    data-field="header1"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      const currentText = (component.props?.header1 as string) || "Header 1";
                      setEditingField("header1");
                      setEditValue(currentText);
                      setIsEditing(true);
                    }}
                  >
                    {isEditing && editingField === "header1" ? (
                      <Box sx={{ textAlign: "center", width: "100%" }}>
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            ...inlineInputStyle,
                            textAlign: "center",
                            fontWeight: "bold",
                          }}
                        />
                      </Box>
                    ) : (
                      (component.props?.header1 as string) || "Header 1"
                    )}
                  </TableCell>
                  <TableCell
                    sx={{ borderColor: componentColor, fontWeight: "bold", textAlign: "center" }}
                    data-field="header2"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      const currentText = (component.props?.header2 as string) || "Header 2";
                      setEditingField("header2");
                      setEditValue(currentText);
                      setIsEditing(true);
                    }}
                  >
                    {isEditing && editingField === "header2" ? (
                      <Box sx={{ textAlign: "center", width: "100%" }}>
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            ...inlineInputStyle,
                            textAlign: "center",
                            fontWeight: "bold",
                          }}
                        />
                      </Box>
                    ) : (
                      (component.props?.header2 as string) || "Header 2"
                    )}
                  </TableCell>
                  <TableCell
                    sx={{ borderColor: componentColor, fontWeight: "bold", textAlign: "center" }}
                    data-field="header3"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      const currentText = (component.props?.header3 as string) || "Header 3";
                      setEditingField("header3");
                      setEditValue(currentText);
                      setIsEditing(true);
                    }}
                  >
                    {isEditing && editingField === "header3" ? (
                      <Box sx={{ textAlign: "center", width: "100%" }}>
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            ...inlineInputStyle,
                            textAlign: "center",
                            fontWeight: "bold",
                          }}
                        />
                      </Box>
                    ) : (
                      (component.props?.header3 as string) || "Header 3"
                    )}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell
                    sx={{ borderColor: componentColor, textAlign: "center" }}
                    data-field="cell1_1"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      const currentText = (component.props?.cell1_1 as string) || "Cell 1-1";
                      setEditingField("cell1_1");
                      setEditValue(currentText);
                      setIsEditing(true);
                    }}
                  >
                    {isEditing && editingField === "cell1_1" ? (
                      <Box sx={{ textAlign: "center", width: "100%" }}>
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            ...inlineInputStyle,
                            textAlign: "center",
                          }}
                        />
                      </Box>
                    ) : (
                      (component.props?.cell1_1 as string) || "Cell 1-1"
                    )}
                  </TableCell>
                  <TableCell
                    sx={{ borderColor: componentColor, textAlign: "center" }}
                    data-field="cell1_2"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      const currentText = (component.props?.cell1_2 as string) || "Cell 1-2";
                      setEditingField("cell1_2");
                      setEditValue(currentText);
                      setIsEditing(true);
                    }}
                  >
                    {isEditing && editingField === "cell1_2" ? (
                      <Box sx={{ textAlign: "center", width: "100%" }}>
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            ...inlineInputStyle,
                            textAlign: "center",
                          }}
                        />
                      </Box>
                    ) : (
                      (component.props?.cell1_2 as string) || "Cell 1-2"
                    )}
                  </TableCell>
                  <TableCell
                    sx={{ borderColor: componentColor, textAlign: "center" }}
                    data-field="cell1_3"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      const currentText = (component.props?.cell1_3 as string) || "Cell 1-3";
                      setEditingField("cell1_3");
                      setEditValue(currentText);
                      setIsEditing(true);
                    }}
                  >
                    {isEditing && editingField === "cell1_3" ? (
                      <Box sx={{ textAlign: "center", width: "100%" }}>
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            ...inlineInputStyle,
                            textAlign: "center",
                          }}
                        />
                      </Box>
                    ) : (
                      (component.props?.cell1_3 as string) || "Cell 1-3"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    sx={{ borderColor: componentColor, textAlign: "center" }}
                    data-field="cell2_1"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      const currentText = (component.props?.cell2_1 as string) || "Cell 2-1";
                      setEditingField("cell2_1");
                      setEditValue(currentText);
                      setIsEditing(true);
                    }}
                  >
                    {isEditing && editingField === "cell2_1" ? (
                      <Box sx={{ textAlign: "center", width: "100%" }}>
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            ...inlineInputStyle,
                            textAlign: "center",
                          }}
                        />
                      </Box>
                    ) : (
                      (component.props?.cell2_1 as string) || "Cell 2-1"
                    )}
                  </TableCell>
                  <TableCell
                    sx={{ borderColor: componentColor, textAlign: "center" }}
                    data-field="cell2_2"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      const currentText = (component.props?.cell2_2 as string) || "Cell 2-2";
                      setEditingField("cell2_2");
                      setEditValue(currentText);
                      setIsEditing(true);
                    }}
                  >
                    {isEditing && editingField === "cell2_2" ? (
                      <Box sx={{ textAlign: "center", width: "100%" }}>
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            ...inlineInputStyle,
                            textAlign: "center",
                          }}
                        />
                      </Box>
                    ) : (
                      (component.props?.cell2_2 as string) || "Cell 2-2"
                    )}
                  </TableCell>
                  <TableCell
                    sx={{ borderColor: componentColor, textAlign: "center" }}
                    data-field="cell2_3"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      const currentText = (component.props?.cell2_3 as string) || "Cell 2-3";
                      setEditingField("cell2_3");
                      setEditValue(currentText);
                      setIsEditing(true);
                    }}
                  >
                    {isEditing && editingField === "cell2_3" ? (
                      <Box sx={{ textAlign: "center", width: "100%" }}>
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            ...inlineInputStyle,
                            textAlign: "center",
                          }}
                        />
                      </Box>
                    ) : (
                      (component.props?.cell2_3 as string) || "Cell 2-3"
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        );
      default:
        return null;
    }
  };


  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Draggable container wrapper */}
      <div
        style={containerStyle}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleTextClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {renderComponent()}
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
            {canEditText && (
              <SpeedDialAction
                key="edit-text"
                icon={<EditNoteIcon />}
                tooltipTitle="Text"
                tooltipOpen
                tooltipPlacement="right"
                onClick={handleEditText}
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
            )}
            <SpeedDialAction
              key="copy"
              icon={<CopyIcon />}
              tooltipTitle="Copy"
              tooltipOpen
              tooltipPlacement="right"
              onClick={handleCopy}
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
            <SpeedDialAction
              key="edit-color"
              icon={<PaletteIcon />}
              tooltipTitle="Color"
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
            <SpeedDialAction
              key="delete"
              icon={<DeleteIcon />}
              tooltipTitle="Delete"
              tooltipOpen
              tooltipPlacement="right"
              onClick={handleDelete}
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
