import { Add as AddIcon } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useColorUtils } from "../../contexts/ColorUtilsContext";
import type { ComponentType } from "../../types/component";
import { getComponentItems } from "../../utils/component/componentPreviewUtils";

interface ComponentsDrawerProps {
  onComponentSelect: (type: ComponentType) => void;
  selectedComponentType: ComponentType | null;
  componentColor: string;
  onDragStart?: (componentLabel: string) => void;
}

const fuzzyMatch = (query: string, target: string): boolean => {
  if (!query) {
    return true;
  }

  let queryIndex = 0;
  let targetIndex = 0;
  const normalizedQuery = query.toLowerCase();
  const normalizedTarget = target.toLowerCase();

  while (
    queryIndex < normalizedQuery.length &&
    targetIndex < normalizedTarget.length
  ) {
    if (normalizedQuery[queryIndex] === normalizedTarget[targetIndex]) {
      queryIndex += 1;
    }
    targetIndex += 1;
  }

  return queryIndex === normalizedQuery.length;
};

export default function ComponentsDrawer({
  onComponentSelect,
  selectedComponentType,
  componentColor,
  onDragStart,
}: ComponentsDrawerProps) {
  const componentItems = getComponentItems(componentColor);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const { registerDrawerContainer } = useColorUtils();

  // Register drawer container for live color updates
  useEffect(() => {
    registerDrawerContainer(containerRef.current);
    return () => {
      registerDrawerContainer(null);
    };
  }, [registerDrawerContainer]);

  // Set base color CSS variable when componentColor changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--drawer-component-color",
        componentColor,
      );
    }
  }, [componentColor]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return componentItems;
    }
    return componentItems.filter((item) => {
      const searchable = `${item.label} ${item.type}`;
      return fuzzyMatch(normalizedQuery, searchable);
    });
  }, [componentItems, searchQuery]);

  return (
    <Paper
      ref={containerRef}
      sx={{
        width: 250,
        height: "100%",
        padding: 2,
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ userSelect: "none" }}>
          Components
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          gutterBottom
          sx={{ userSelect: "none" }}
        >
          Click or drag to add to canvas
        </Typography>
        <TextField
          size="small"
          fullWidth
          placeholder="Search components"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mt: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          inputProps={{ "aria-label": "Search components" }}
        />
        <Divider sx={{ mt: 1.5, mb: 0.5 }} />
      </Box>
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List>
          {filteredItems.length === 0 ? (
            <Box sx={{ px: 2, py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No components match "{searchQuery.trim()}"
              </Typography>
            </Box>
          ) : (
            filteredItems.map((item) => (
              <ListItem key={item.type} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={selectedComponentType === item.type}
                  onClick={() => onComponentSelect(item.type)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("componentType", item.type);
                    e.dataTransfer.effectAllowed = "copy";
                    
                    // Create custom drag image showing just the component preview
                    const dragImageContainer = document.createElement("div");
                    dragImageContainer.style.position = "absolute";
                    dragImageContainer.style.top = "-9999px";
                    dragImageContainer.style.left = "-9999px";
                    dragImageContainer.style.width = "120px";
                    dragImageContainer.style.height = "80px";
                    dragImageContainer.style.display = "flex";
                    dragImageContainer.style.alignItems = "center";
                    dragImageContainer.style.justifyContent = "center";
                    dragImageContainer.style.backgroundColor = "white";
                    dragImageContainer.style.border = "1px solid rgba(0, 0, 0, 0.1)";
                    dragImageContainer.style.borderRadius = "4px";
                    dragImageContainer.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                    dragImageContainer.style.padding = "8px";
                    
                    // Clone the preview element
                    const previewBox = e.currentTarget.querySelector(
                      '[data-preview-container]',
                    ) as HTMLElement;
                    if (previewBox) {
                      const clonedPreview = previewBox.cloneNode(true) as HTMLElement;
                      clonedPreview.style.pointerEvents = "none";
                      clonedPreview.style.width = "100%";
                      clonedPreview.style.height = "100%";
                      dragImageContainer.appendChild(clonedPreview);
                    } else {
                      // Fallback: create a simple text representation
                      const fallbackPreview = document.createElement("div");
                      fallbackPreview.style.width = "100%";
                      fallbackPreview.style.height = "100%";
                      fallbackPreview.style.display = "flex";
                      fallbackPreview.style.alignItems = "center";
                      fallbackPreview.style.justifyContent = "center";
                      fallbackPreview.textContent = item.label;
                      dragImageContainer.appendChild(fallbackPreview);
                    }
                    
                    document.body.appendChild(dragImageContainer);
                    
                    // Set the drag image with offset to center it on cursor
                    const offsetX = 60; // Half of width
                    const offsetY = 40; // Half of height
                    e.dataTransfer.setDragImage(
                      dragImageContainer,
                      offsetX,
                      offsetY,
                    );
                    
                    // Clean up after a short delay
                    setTimeout(() => {
                      document.body.removeChild(dragImageContainer);
                    }, 0);
                    
                    // Notify parent that dragging has started
                    if (onDragStart) {
                      onDragStart(item.label);
                    }
                  }}
                  sx={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    border: "1px solid",
                    borderColor:
                      selectedComponentType === item.type
                        ? "primary.main"
                        : "divider",
                    borderRadius: 1,
                    cursor: "grab",
                    "&:hover": {
                      borderColor: "primary.main",
                    },
                    "&:active": {
                      cursor: "grabbing",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      mb: 1,
                    }}
                  >
                    <AddIcon sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2" fontWeight="medium">
                      {item.label}
                    </Typography>
                  </Box>
                  <Box
                    data-preview-container
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      pt: 1,
                      borderTop: "1px solid",
                      borderColor: "divider",
                      pointerEvents: "none",
                    }}
                  >
                    {item.preview}
                  </Box>
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Paper>
  );
}
