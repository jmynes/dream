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
import type { ComponentType } from "../../types/component";
import { getTextColorForFilled, isDarkColor } from "../color/colorUtils";

// Helper to get CSS variable reference for live color updates
const getLiveColor = (componentColor: string) =>
  `var(--drawer-component-color, ${componentColor})`;

interface ComponentPreviewProps {
  type: ComponentType;
  componentColor: string;
}

/**
 * Generate preview component for component drawer
 */
export function getComponentPreview({
  type,
  componentColor,
}: ComponentPreviewProps): React.ReactNode {
  const liveColor = getLiveColor(componentColor);

  switch (type) {
    case "Avatar":
      return (
        <Avatar
          sx={{
            bgcolor: liveColor,
            color: `${getTextColorForFilled(componentColor)} !important`,
          }}
        >
          A
        </Avatar>
      );

    case "Box":
      return (
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
      );

    case "Button":
      return (
        <Button
          variant="contained"
          sx={{
            backgroundColor: liveColor,
            "&:hover": { backgroundColor: liveColor },
            color: getTextColorForFilled(componentColor),
            textTransform: "none",
          }}
        >
          Button
        </Button>
      );

    case "Card":
      return (
        <Card sx={{ minWidth: 120, border: `2px solid ${liveColor}`, display: "flex" }}>
          <CardContent
            sx={{
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: 60,
              p: 2,
              "&:last-child": {
                pb: 2,
              },
            }}
          >
            <Typography variant="body2" sx={{ width: "100%" }}>
              Card
            </Typography>
          </CardContent>
        </Card>
      );

    case "Checkbox":
      return (
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
      );

    case "Chip":
      return (
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
      );

    case "Divider":
      return (
        <Divider
          sx={{
            width: 120,
            borderColor: liveColor,
            borderTopWidth: "2px",
          }}
        />
      );

    case "Paper":
      return (
        <Paper
          sx={{ p: 2, minWidth: 120, textAlign: "center", backgroundColor: liveColor }}
        >
          <Typography variant="body2" sx={{ color: getTextColorForFilled(componentColor) }}>
            Paper
          </Typography>
        </Paper>
      );

    case "Slider":
      return (
        <Slider
          defaultValue={50}
          sx={{
            width: 120,
            color: liveColor,
            "& .MuiSlider-thumb": {
              ...(isDarkColor(componentColor)
                ? {}
                : {
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                  }),
            },
            "& .MuiSlider-track": {
              ...(isDarkColor(componentColor)
                ? {}
                : {
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                  }),
            },
            "& .MuiSlider-rail": {
              ...(isDarkColor(componentColor)
                ? {}
                : {
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                  }),
            },
          }}
        />
      );

    case "Switch":
      return (
        <Switch
          defaultChecked
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": { color: liveColor },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: liveColor,
              ...(isDarkColor(componentColor)
                ? {}
                : {
                    boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.2)",
                  }),
            },
            "& .MuiSwitch-thumb": {
              ...(isDarkColor(componentColor)
                ? {}
                : {
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                  }),
            },
          }}
        />
      );

    case "TextField":
      return <TextField label="Text Field" size="small" />;

    case "Typography":
      return (
        <Typography variant="body1" sx={{ color: liveColor }}>
          Typography
        </Typography>
      );

    case "Radio":
      return (
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
      );

    case "Table":
      return (
        <TableContainer sx={{ maxHeight: 100, maxWidth: 220 }}>
          <Table size="small" sx={{ border: `1px solid ${liveColor}` }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    borderColor: liveColor,
                    fontWeight: "bold",
                    p: 0.5,
                    fontSize: "0.7rem",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  H1
                </TableCell>
                <TableCell
                  sx={{
                    borderColor: liveColor,
                    fontWeight: "bold",
                    p: 0.5,
                    fontSize: "0.7rem",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  H2
                </TableCell>
                <TableCell
                  sx={{
                    borderColor: liveColor,
                    fontWeight: "bold",
                    p: 0.5,
                    fontSize: "0.7rem",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  H3
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell
                  sx={{
                    borderColor: liveColor,
                    p: 0.5,
                    fontSize: "0.7rem",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  C1
                </TableCell>
                <TableCell
                  sx={{
                    borderColor: liveColor,
                    p: 0.5,
                    fontSize: "0.7rem",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  C2
                </TableCell>
                <TableCell
                  sx={{
                    borderColor: liveColor,
                    p: 0.5,
                    fontSize: "0.7rem",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  C3
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      );

    default:
      return null;
  }
}

interface ComponentItem {
  type: ComponentType;
  label: string;
  preview: React.ReactNode;
}

/**
 * Get all component items with their previews for the drawer
 */
export function getComponentItems(componentColor: string): ComponentItem[] {
  const types: ComponentType[] = [
    "Avatar",
    "Box",
    "Button",
    "Card",
    "Checkbox",
    "Chip",
    "Divider",
    "Paper",
    "Slider",
    "Switch",
    "TextField",
    "Typography",
    "Radio",
    "Table",
  ];

  const items: ComponentItem[] = types.map((type) => ({
    type,
    label: type === "TextField" ? "Text Field" : type,
    preview: getComponentPreview({ type, componentColor }),
  }));

  // Sort alphabetically by label
  return items.sort((a, b) => a.label.localeCompare(b.label));
}

