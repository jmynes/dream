import {
  Delete as DeleteIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { useState } from "react";

interface MenuBarProps {
  onDeleteEverything: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function MenuBar({
  onDeleteEverything,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: MenuBarProps) {
  const [fileMenuAnchor, setFileMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [optionsMenuAnchor, setOptionsMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [helpMenuAnchor, setHelpMenuAnchor] = useState<null | HTMLElement>(
    null,
  );

  const handleMenuOpen = (
    setter: (anchor: HTMLElement | null) => void,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    setter(event.currentTarget);
  };

  const handleMenuClose = (setter: (anchor: HTMLElement | null) => void) => {
    setter(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#f0f0f0",
        fontSize: "13px",
      }}
    >
      <Button
        sx={{
          padding: "4px 12px",
          minWidth: "auto",
          fontSize: "13px",
          textTransform: "none",
          color: "#000",
          borderRadius: 0,
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
        }}
        onClick={(e) => handleMenuOpen(setFileMenuAnchor, e)}
      >
        File
      </Button>
      <Menu
        anchorEl={fileMenuAnchor}
        open={Boolean(fileMenuAnchor)}
        onClose={() => handleMenuClose(setFileMenuAnchor)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={() => handleMenuClose(setFileMenuAnchor)}>
          New
        </MenuItem>
        <MenuItem onClick={() => handleMenuClose(setFileMenuAnchor)}>
          Open...
        </MenuItem>
        <MenuItem onClick={() => handleMenuClose(setFileMenuAnchor)}>
          Save
        </MenuItem>
        <MenuItem onClick={() => handleMenuClose(setFileMenuAnchor)}>
          Save As...
        </MenuItem>
        <MenuItem onClick={() => handleMenuClose(setFileMenuAnchor)}>
          Exit
        </MenuItem>
      </Menu>

      <Button
        sx={{
          padding: "4px 12px",
          minWidth: "auto",
          fontSize: "13px",
          textTransform: "none",
          color: "#000",
          borderRadius: 0,
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
        }}
        onClick={(e) => handleMenuOpen(setOptionsMenuAnchor, e)}
      >
        Options
      </Button>
      <Menu
        anchorEl={optionsMenuAnchor}
        open={Boolean(optionsMenuAnchor)}
        onClose={() => handleMenuClose(setOptionsMenuAnchor)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={() => handleMenuClose(setOptionsMenuAnchor)}>
          Preferences...
        </MenuItem>
        <MenuItem onClick={() => handleMenuClose(setOptionsMenuAnchor)}>
          Settings...
        </MenuItem>
      </Menu>

      <Button
        sx={{
          padding: "4px 12px",
          minWidth: "auto",
          fontSize: "13px",
          textTransform: "none",
          color: "#000",
          borderRadius: 0,
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
        }}
        onClick={(e) => handleMenuOpen(setHelpMenuAnchor, e)}
      >
        Help
      </Button>
      <Menu
        anchorEl={helpMenuAnchor}
        open={Boolean(helpMenuAnchor)}
        onClose={() => handleMenuClose(setHelpMenuAnchor)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={() => handleMenuClose(setHelpMenuAnchor)}>
          About
        </MenuItem>
        <MenuItem onClick={() => handleMenuClose(setHelpMenuAnchor)}>
          Documentation
        </MenuItem>
      </Menu>

      <Box sx={{ flex: 1 }} />

      <Tooltip title="Undo (Ctrl+Z / Cmd+Z)">
        <span style={{ display: "inline-flex" }}>
          <IconButton
            disabled={!canUndo}
            onClick={onUndo}
            color="default"
            size="small"
            sx={{ marginLeft: 1 }}
          >
            <UndoIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Redo (Ctrl+Y / Cmd+Y)">
        <span style={{ display: "inline-flex" }}>
          <IconButton
            disabled={!canRedo}
            onClick={onRedo}
            color="default"
            size="small"
          >
            <RedoIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Delete Everything">
        <IconButton
          color="error"
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to delete everything? This cannot be undone.",
              )
            ) {
              onDeleteEverything();
            }
          }}
          size="small"
          sx={{ marginRight: 1 }}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
