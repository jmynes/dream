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
  FormControlLabel,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  Paper,
  Radio,
  RadioGroup,
  Slider,
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
import SearchIcon from "@mui/icons-material/Search";
import type { ComponentType } from "../types/component";
import { useMemo, useState, useEffect, useRef } from "react";
import { useColorUtils } from "../contexts/ColorUtilsContext";

interface ComponentsDrawerProps {
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

// Helper to create CSS variable reference for live color updates
const getLiveColor = (componentColor: string) => `var(--drawer-component-color, ${componentColor})`;

const getComponentItems = (componentColor: string): ComponentItem[] => {
  // Use CSS variable for live color updates in drawer previews
  const liveColor = getLiveColor(componentColor);
  
  const items: ComponentItem[] = [
    {
      type: "Avatar",
      label: "Avatar",
      preview: <Avatar sx={{ bgcolor: liveColor, color: `${getTextColorForFilled(componentColor)} !important` }}>A</Avatar>,
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
            borderColor: liveColor,
            backgroundColor: `color-mix(in srgb, ${liveColor} 12.5%, transparent)`,
            textAlign: "center",
          }}
        >
          <Typography variant="body2">Box</Typography>
        </Box>
      ),
    },
    {
      type: "Button",
      label: "Button",
      preview: (
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: liveColor, 
            "&:hover": { backgroundColor: liveColor },
            color: getTextColorForFilled(componentColor),
          }}
        >
          Button
        </Button>
      ),
    },
    {
      type: "Card",
      label: "Card",
      preview: (
        <Card sx={{ minWidth: 120, border: `2px solid ${liveColor}` }}>
          <CardContent>
            <Typography variant="body2">Card</Typography>
          </CardContent>
        </Card>
      ),
    },
    {
      type: "Checkbox",
      label: "Checkbox",
      preview: (
        <FormControlLabel
          control={
            <Checkbox 
              defaultChecked 
              sx={{ 
                color: liveColor,
                "&.Mui-checked": { 
                  color: liveColor,
                },
                "& .MuiSvgIcon-root": {
                  color: liveColor,
                },
                "&.Mui-checked .MuiSvgIcon-root": {
                  color: liveColor,
                },
              }} 
            />
          }
          label="Checkbox"
        />
      ),
    },
    {
      type: "Chip",
      label: "Chip",
      preview: (
        <Chip
          label="Chip"
          sx={{
            backgroundColor: liveColor,
            color: `${getTextColorForFilled(componentColor)} !important`,
            "& .MuiChip-label": {
              color: `${getTextColorForFilled(componentColor)} !important`,
            },
          }}
        />
      ),
    },
    {
      type: "Divider",
      label: "Divider",
      preview: (
        <Divider
          sx={{
            width: 120,
            borderColor: liveColor,
            borderTopWidth: "2px",
          }}
        />
      ),
    },
    {
      type: "Paper",
      label: "Paper",
      preview: (
        <Paper sx={{ p: 2, minWidth: 120, textAlign: "center", backgroundColor: liveColor }}>
          <Typography variant="body2" sx={{ color: getTextColorForFilled(componentColor) }}>
            Paper
          </Typography>
        </Paper>
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
            color: liveColor,
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
      type: "Switch",
      label: "Switch",
      preview: (
        <Switch 
          defaultChecked 
          sx={{ 
            "& .MuiSwitch-switchBase.Mui-checked": { color: liveColor }, 
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { 
              backgroundColor: liveColor,
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
      type: "TextField",
      label: "Text Field",
      preview: <TextField label="Text Field" size="small" />,
    },
    {
      type: "Typography",
      label: "Typography",
      preview: <Typography variant="body1" sx={{ color: liveColor }}>Typography</Typography>,
    },
    {
      type: "Radio",
      label: "Radio",
      preview: (
        <RadioGroup row>
          <FormControlLabel
            value="option1"
            control={
              <Radio
                sx={{
                  color: isDarkColor(componentColor) ? liveColor : "#000000",
                  "&.Mui-checked": {
                    color: liveColor,
                  },
                }}
              />
            }
            label="Option 1"
          />
          <FormControlLabel
            value="option2"
            control={
              <Radio
                sx={{
                  color: isDarkColor(componentColor) ? liveColor : "#000000",
                  "&.Mui-checked": {
                    color: liveColor,
                  },
                }}
              />
            }
            label="Option 2"
          />
        </RadioGroup>
      ),
    },
    {
      type: "Table",
      label: "Table",
      preview: (
        <TableContainer sx={{ maxHeight: 100, maxWidth: 220 }}>
          <Table size="small" sx={{ border: `1px solid ${liveColor}` }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderColor: liveColor, fontWeight: "bold", p: 0.5, fontSize: "0.7rem" }}>
                  H1
                </TableCell>
                <TableCell sx={{ borderColor: liveColor, fontWeight: "bold", p: 0.5, fontSize: "0.7rem" }}>
                  H2
                </TableCell>
                <TableCell sx={{ borderColor: liveColor, fontWeight: "bold", p: 0.5, fontSize: "0.7rem" }}>
                  H3
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ borderColor: liveColor, p: 0.5, fontSize: "0.7rem" }}>
                  C1
                </TableCell>
                <TableCell sx={{ borderColor: liveColor, p: 0.5, fontSize: "0.7rem" }}>
                  C2
                </TableCell>
                <TableCell sx={{ borderColor: liveColor, p: 0.5, fontSize: "0.7rem" }}>
                  C3
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ),
    },
  ];
  
  // Sort alphabetically by label
  return items.sort((a, b) => a.label.localeCompare(b.label));
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
