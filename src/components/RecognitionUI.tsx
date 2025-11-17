import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import type { ComponentType } from "../types/component";

interface RecognitionFailed {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PendingRecognition {
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RecognitionUIProps {
  pendingRecognition: PendingRecognition | null;
  recognitionFailed: RecognitionFailed | null;
  onSelectComponentType: (type: ComponentType) => void;
  onSubmitRecognition: () => void;
  onCancelRecognition: () => void;
}

export default function RecognitionUI({
  pendingRecognition,
  recognitionFailed,
  onSelectComponentType,
  onSubmitRecognition,
  onCancelRecognition,
}: RecognitionUIProps) {
  // Recognition failed UI - allow manual selection
  if (recognitionFailed && !pendingRecognition) {
    return (
      <Paper
        sx={{
          position: "absolute",
          left: recognitionFailed.x + recognitionFailed.width / 2,
          top: recognitionFailed.y - 80,
          transform: "translateX(-50%)",
          padding: 2,
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          minWidth: 220,
          boxShadow: 3,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant="body2" fontWeight="medium" color="error">
          Could not recognize shape
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Select a component type:
        </Typography>
        <FormControl size="small" fullWidth>
          <Select
            value=""
            displayEmpty
            onChange={(e) => {
              const type = e.target.value as ComponentType;
              if (type) {
                onSelectComponentType(type);
              }
            }}
            sx={{ width: "100%" }}
          >
            <MenuItem value="" disabled>
              <em>Choose component...</em>
            </MenuItem>
            <MenuItem value="Checkbox">Checkbox</MenuItem>
            <MenuItem value="Button">Button</MenuItem>
            <MenuItem value="Card">Card</MenuItem>
            <MenuItem value="TextField">TextField</MenuItem>
            <MenuItem value="Avatar">Avatar</MenuItem>
            <MenuItem value="Divider">Divider</MenuItem>
            <MenuItem value="Typography">Typography</MenuItem>
            <MenuItem value="Switch">Switch</MenuItem>
            <MenuItem value="Slider">Slider</MenuItem>
            <MenuItem value="Chip">Chip</MenuItem>
            <MenuItem value="Paper">Paper</MenuItem>
            <MenuItem value="Box">Box</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={onCancelRecognition}
            color="inherit"
            fullWidth
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    );
  }

  // Pending recognition UI
  if (pendingRecognition) {
    return (
      <Paper
        sx={{
          position: "absolute",
          left: pendingRecognition.x + pendingRecognition.width / 2,
          top: pendingRecognition.y - 60,
          transform: "translateX(-50%)",
          padding: 2,
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minWidth: 180,
          boxShadow: 3,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant="body2" fontWeight="medium">
          Recognized: {pendingRecognition.type}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={onSubmitRecognition}
            color="primary"
          >
            Submit
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onCancelRecognition}
            color="inherit"
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    );
  }

  return null;
}
