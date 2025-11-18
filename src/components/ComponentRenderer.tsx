import {
  Box,
  Popover,
  SpeedDial,
  SpeedDialAction,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  EditNote as EditNoteIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";
import { useState, useRef, useEffect, memo, useCallback } from "react";
import type { CanvasComponent } from "../types/component";
import { ChromePicker } from "react-color";

// Type for react-color color result
type ColorResult = {
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
    a?: number;
  };
};

// Convert rgba to hex with alpha (8-digit if alpha < 1)
const rgbaToHex = (r: number, g: number, b: number, a: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16).toUpperCase();
    return hex.length === 1 ? `0${hex}` : hex;
  };
  
  const alpha = Math.round(a * 255);
  if (alpha === 255) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
};

import ButtonRenderer from "./renderers/ButtonRenderer";
import TextFieldRenderer from "./renderers/TextFieldRenderer";
import CardRenderer from "./renderers/CardRenderer";
import TypographyRenderer from "./renderers/TypographyRenderer";
import CheckboxRenderer from "./renderers/CheckboxRenderer";
import SwitchRenderer from "./renderers/SwitchRenderer";
import SliderRenderer from "./renderers/SliderRenderer";
import ChipRenderer from "./renderers/ChipRenderer";
import AvatarRenderer from "./renderers/AvatarRenderer";
import DividerRenderer from "./renderers/DividerRenderer";
import PaperRenderer from "./renderers/PaperRenderer";
import BoxRenderer from "./renderers/BoxRenderer";
import RadioRenderer from "./renderers/RadioRenderer";
import TableRenderer from "./renderers/TableRenderer";
import { resizeHandleBaseStyle } from "./renderers/rendererUtils";

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

function ComponentRenderer({
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
  const [colorPickerAnchor, setColorPickerAnchor] = useState<{ x: number; y: number } | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

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

  const handleSpeedDialClose = (event: React.SyntheticEvent<Element, Event>, reason?: string) => {
    // Don't close if the reason is mouseLeave and the mouse is over a tooltip
    if (reason === "mouseLeave") {
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
    // Position color picker at the right side of the component (same as SpeedDial)
    if (componentRef.current) {
      const rect = componentRef.current.getBoundingClientRect();
      setColorPickerAnchor({ x: rect.right, y: rect.top + rect.height / 2 });
    }
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

  const handleColorChange = useCallback((colorResult: ColorResult) => {
    if (onComponentColorChange) {
      const rgba = colorResult.rgb;
      const a = rgba.a ?? 1;
      const hexColor = a === 1 
        ? colorResult.hex 
        : rgbaToHex(rgba.r, rgba.g, rgba.b, a);
      onComponentColorChange(component.id, hexColor);
    }
  }, [onComponentColorChange, component.id]);
  
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
    _event: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => {
    const numericValue = Array.isArray(value) ? value[0] : value;
    sliderValueRef.current = numericValue;
    isInteractingWithSliderRef.current = true;
    scheduleSliderRenderUpdate();
  };

  const handleSliderChangeCommitted = (
    _event: Event | React.SyntheticEvent<Element, Event>,
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

  const resizeHandleBaseStyleLocal: React.CSSProperties = {
    ...resizeHandleBaseStyle,
    zIndex: 11,
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
  };

  // Corner handles (diagonal resize)
  const topLeftHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyleLocal,
    top: -4,
    left: -4,
    cursor: "nw-resize",
  };

  const topRightHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyleLocal,
    top: -4,
    right: -4,
    cursor: "ne-resize",
  };

  const bottomLeftHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyleLocal,
    bottom: -4,
    left: -4,
    cursor: "sw-resize",
  };

  const bottomRightHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyleLocal,
    bottom: -4,
    right: -4,
    cursor: "se-resize",
  };

  // Edge handles (single direction resize)
  const topHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyleLocal,
    top: -4,
    left: "50%",
    transform: "translateX(-50%)",
    cursor: "n-resize",
  };

  const rightHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyleLocal,
    right: -4,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "e-resize",
  };

  const bottomHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyleLocal,
    bottom: -4,
    left: "50%",
    transform: "translateX(-50%)",
    cursor: "s-resize",
  };

  const leftHandleStyle: React.CSSProperties = {
    ...resizeHandleBaseStyleLocal,
    left: -4,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "w-resize",
  };

  const handleRadioDoubleClick = (field: string, currentText: string) => {
    setEditingField(field);
    setEditValue(currentText);
    setIsEditing(true);
  };

  const handleCellDoubleClick = (field: string, currentText: string) => {
    setEditingField(field);
    setEditValue(currentText);
    setIsEditing(true);
  };

  const handleCheckboxDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentText = (component.props?.label as string) || "Checkbox";
    setEditingField("label");
    setEditValue(currentText);
    setIsEditing(true);
  };

  const renderComponent = () => {
    const widthProps = componentWidth ? { sx: { width: "100%" } } : {};
    const heightProps = componentHeight ? { sx: { height: "100%" } } : {};
    const centeredAlignment = { sx: { textAlign: "center" as const } };
    const componentColor = component.color || "#1976d2";

    const rendererProps = {
      component,
      componentColor,
      widthProps,
      heightProps,
      centeredAlignment,
      isEditing,
      editingField: editingField || "",
      editValue,
      inputRef,
      onEditChange: setEditValue,
      onEditBlur: handleBlur,
      onEditKeyDown: handleKeyDown,
      textWidthRef,
    };

    switch (component.type) {
      case "Button":
        return <ButtonRenderer {...rendererProps} />;
      case "TextField":
        return <TextFieldRenderer {...rendererProps} />;
      case "Card":
        return <CardRenderer {...rendererProps} componentWidth={componentWidth} />;
      case "Typography":
        return <TypographyRenderer {...rendererProps} />;
      case "Checkbox":
        return <CheckboxRenderer {...rendererProps} onDoubleClick={handleCheckboxDoubleClick} />;
      case "Switch":
        return <SwitchRenderer {...rendererProps} />;
      case "Slider":
        return (
          <SliderRenderer
            {...rendererProps}
            sliderDisplayValue={sliderDisplayValue}
            onSliderMouseDown={handleSliderMouseDown}
            onSliderMouseMove={handleSliderMouseMove}
            onSliderMouseUp={handleSliderMouseUp}
            onSliderChange={handleSliderChange}
            onSliderChangeCommitted={handleSliderChangeCommitted}
          />
        );
      case "Chip":
        return <ChipRenderer {...rendererProps} />;
      case "Avatar":
        return (
          <AvatarRenderer
            {...rendererProps}
            componentWidth={componentWidth}
            componentHeight={componentHeight}
          />
        );
      case "Divider":
        return (
          <DividerRenderer
            {...rendererProps}
            componentWidth={componentWidth}
            componentHeight={componentHeight}
          />
        );
      case "Paper":
        return <PaperRenderer {...rendererProps} />;
      case "Box":
        return <BoxRenderer {...rendererProps} />;
      case "Radio":
        return (
          <RadioRenderer
            {...rendererProps}
            onRadioDoubleClick={handleRadioDoubleClick}
          />
        );
      case "Table":
        return (
          <TableRenderer
            {...rendererProps}
            onCellDoubleClick={handleCellDoubleClick}
          />
        );
      default:
        return null;
    }
  };


  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Draggable container wrapper */}
      <div
        ref={componentRef}
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
              const reasonStr = String(reason);
              if (reasonStr === "backdropClick" || reasonStr === "toggle") {
                handleSpeedDialClose(event as React.SyntheticEvent<Element, Event>, reasonStr);
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
        anchorReference="anchorPosition"
        anchorPosition={
          colorPickerAnchor
            ? {
                top: colorPickerAnchor.y,
                left: colorPickerAnchor.x,
              }
            : undefined
        }
        onClose={handleColorPickerClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ "& > div": { boxShadow: "none !important", border: "1px solid #e0e0e0", borderRadius: "4px" } }}>
            <ChromePicker
              color={component.color || "#1976d2"}
              onChange={handleColorChange}
              onChangeComplete={handleColorChange}
            />
          </Box>
        </Box>
      </Popover>
    </>
  );
}

// Memoize ComponentRenderer to prevent unnecessary re-renders
// Only re-render when component data or relevant props actually change
export default memo(ComponentRenderer, (prevProps, nextProps) => {
  const prev = prevProps.component;
  const next = nextProps.component;
  
  // Deep comparison of component data (object references change on array updates)
  if (
    prev.id !== next.id ||
    prev.type !== next.type ||
    prev.x !== next.x ||
    prev.y !== next.y ||
    prev.width !== next.width ||
    prev.height !== next.height ||
    prev.color !== next.color
  ) {
    return false; // Component data changed, need to re-render
  }
  
  // Compare props object (shallow check for common props)
  // Only check if references are different to avoid expensive deep comparison
  if (prev.props !== next.props) {
    // Quick check: if props reference is the same, they're equal
    // If different, assume changed (could optimize further if needed)
    const prevKeys = Object.keys(prev.props || {});
    const nextKeys = Object.keys(next.props || {});
    if (prevKeys.length !== nextKeys.length) {
      return false; // Props changed
    }
    // Check key props that commonly change
    for (const key of ['text', 'label', 'value', 'checked', 'selected']) {
      if (prev.props?.[key] !== next.props?.[key]) {
        return false; // Props changed
      }
    }
  }
  
  // Check if selection/dragging state changed
  if (
    prevProps.isDragging !== nextProps.isDragging ||
    prevProps.isSelected !== nextProps.isSelected ||
    prevProps.isTextSelectMode !== nextProps.isTextSelectMode
  ) {
    return false; // State changed, need to re-render
  }
  
  // Props are equal, skip re-render
  return true;
});
