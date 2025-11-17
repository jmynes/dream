import { Add as AddIcon } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Paper,
  Slider,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { ComponentType } from "../types/component";
import { useMemo, useState } from "react";

interface ComponentsBarProps {
  onComponentSelect: (type: ComponentType) => void;
  selectedComponentType: ComponentType | null;
  componentColor: string;
}

interface ComponentItem {
  type: ComponentType;
  label: string;
  preview: React.ReactNode;
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

const getComponentItems = (componentColor: string): ComponentItem[] => [
  {
    type: "Button",
    label: "Button",
    preview: (
      <Button 
        variant="contained" 
        sx={{ 
          backgroundColor: componentColor, 
          "&:hover": { backgroundColor: componentColor },
          color: getTextColorForFilled(componentColor),
        }}
      >
        Button
      </Button>
    ),
  },
  {
    type: "TextField",
    label: "Text Field",
    preview: <TextField label="Text Field" size="small" />,
  },
  {
    type: "Card",
    label: "Card",
    preview: (
      <Card sx={{ minWidth: 120, border: `2px solid ${componentColor}` }}>
        <CardContent>
          <Typography variant="body2">Card</Typography>
        </CardContent>
      </Card>
    ),
  },
  {
    type: "Typography",
    label: "Typography",
    preview: <Typography variant="body1" sx={{ color: componentColor }}>Typography</Typography>,
  },
  {
    type: "Checkbox",
    label: "Checkbox",
    preview: (
      <Checkbox 
        defaultChecked 
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
    ),
  },
  {
    type: "Switch",
    label: "Switch",
    preview: (
      <Switch 
        defaultChecked 
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
    ),
  },
  {
    type: "Slider",
    label: "Slider",
    preview: (
      <Slider 
        defaultValue={50} 
        sx={{ 
          width: 120, 
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
    ),
  },
  {
    type: "Chip",
    label: "Chip",
    preview: <Chip label="Chip" sx={{ backgroundColor: componentColor, color: "#fff" }} />,
  },
  {
    type: "Avatar",
    label: "Avatar",
    preview: <Avatar sx={{ bgcolor: componentColor }}>A</Avatar>,
  },
  {
    type: "Divider",
    label: "Divider",
    preview: (
      <Divider
        sx={{
          width: 120,
          borderColor: componentColor,
          borderTopWidth: "2px",
        }}
      />
    ),
  },
  {
    type: "Paper",
    label: "Paper",
    preview: (
      <Paper sx={{ p: 2, minWidth: 120, textAlign: "center", backgroundColor: componentColor }}>
        <Typography variant="body2" sx={{ color: getTextColorForFilled(componentColor) }}>
          Paper
        </Typography>
      </Paper>
    ),
  },
  {
    type: "Box",
    label: "Box",
    preview: (
      <Box
        sx={{
          p: 2,
          minWidth: 120,
          border: "1px dashed",
          borderColor: componentColor,
          backgroundColor: `${componentColor}20`,
          textAlign: "center",
        }}
      >
        <Typography variant="body2">Box</Typography>
      </Box>
    ),
  },
];

export default function ComponentsBar({
  onComponentSelect,
  selectedComponentType,
  componentColor,
}: ComponentsBarProps) {
  const componentItems = getComponentItems(componentColor);
  const [searchQuery, setSearchQuery] = useState("");

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
          inputProps={{ "aria-label": "Search components" }}
        />
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
