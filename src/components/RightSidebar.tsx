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

interface RightSidebarProps {
  onComponentSelect: (type: ComponentType) => void;
  selectedComponentType: ComponentType | null;
}

interface ComponentItem {
  type: ComponentType;
  label: string;
  preview: React.ReactNode;
}

const componentItems: ComponentItem[] = [
  {
    type: "Button",
    label: "Button",
    preview: <Button variant="contained">Button</Button>,
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
      <Card sx={{ minWidth: 120 }}>
        <CardContent>
          <Typography variant="body2">Card</Typography>
        </CardContent>
      </Card>
    ),
  },
  {
    type: "Typography",
    label: "Typography",
    preview: <Typography variant="body1">Typography</Typography>,
  },
  {
    type: "Checkbox",
    label: "Checkbox",
    preview: <Checkbox defaultChecked />,
  },
  {
    type: "Switch",
    label: "Switch",
    preview: <Switch defaultChecked />,
  },
  {
    type: "Slider",
    label: "Slider",
    preview: <Slider defaultValue={50} sx={{ width: 120 }} />,
  },
  {
    type: "Chip",
    label: "Chip",
    preview: <Chip label="Chip" />,
  },
  {
    type: "Avatar",
    label: "Avatar",
    preview: <Avatar>A</Avatar>,
  },
  {
    type: "Divider",
    label: "Divider",
    preview: <Divider sx={{ width: 120 }} />,
  },
  {
    type: "Paper",
    label: "Paper",
    preview: (
      <Paper sx={{ p: 2, minWidth: 120, textAlign: "center" }}>
        <Typography variant="body2">Paper</Typography>
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
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        <Typography variant="body2">Box</Typography>
      </Box>
    ),
  },
];

export default function RightSidebar({
  onComponentSelect,
  selectedComponentType,
}: RightSidebarProps) {
  return (
    <Paper
      sx={{
        width: 250,
        height: "100%",
        padding: 2,
        borderRadius: 1,
        overflow: "auto",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Components
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        Click or drag to add to canvas
      </Typography>
      <List>
        {componentItems.map((item) => (
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
                }}
              >
                {item.preview}
              </Box>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
