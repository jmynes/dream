import { Add as AddIcon } from "@mui/icons-material";
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
import SearchIcon from "@mui/icons-material/Search";
import type { ComponentType } from "../../types/component";
import { useMemo, useState, useEffect, useRef } from "react";
import { useColorUtils } from "../../contexts/ColorUtilsContext";
import { getComponentItems } from "../../utils/component/componentPreviewUtils";

interface ComponentsDrawerProps {
  onComponentSelect: (type: ComponentType) => void;
  selectedComponentType: ComponentType | null;
  componentColor: string;
}

const fuzzyMatch = (query: string, target: string): boolean => {
  if (!query) {
    return true;
  }

  let queryIndex = 0;
  let targetIndex = 0;
  const normalizedQuery = query.toLowerCase();
  const normalizedTarget = target.toLowerCase();

  while (queryIndex < normalizedQuery.length && targetIndex < normalizedTarget.length) {
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
      containerRef.current.style.setProperty("--drawer-component-color", componentColor);
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
        <Typography variant="caption" color="text.secondary" gutterBottom sx={{ userSelect: "none" }}>
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
