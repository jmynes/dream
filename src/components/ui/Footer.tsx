import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Link,
  Tooltip,
} from "@mui/material";
import { Help as HelpIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";

export default function Footer() {
  const [open, setOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const tooltipSlotProps = { tooltip: { sx: { fontSize: "0.85rem" } } };

  const shortcuts = [
    { keys: "?", description: "Open keyboard shortcuts help" },
    { keys: "Ctrl/Cmd + A", description: "Select all components" },
    { keys: "Ctrl/Cmd + C", description: "Copy selected components" },
    { keys: "Ctrl/Cmd + V", description: "Paste components" },
    { keys: "Delete / Backspace", description: "Delete selected components" },
    { keys: "Arrow Keys", description: "Move selected components (1 grid cell)" },
    { keys: "Middle Mouse Button", description: "Reset tools to default cursor" },
    { keys: "Escape", description: "Deselect all / Cancel recognition" },
    { keys: "Enter", description: "Submit shape recognition" },
    { keys: "Ctrl/Cmd + Z", description: "Undo" },
    { keys: "Ctrl/Cmd + Shift + Z", description: "Redo" },
  ];

  // Add keyboard shortcut for ? key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      // Check for ? key
      if (e.key === "?") {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <Box
        sx={{
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#f5f5f5",
          padding: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          userSelect: "none",
          px: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          © {currentYear} - Dream v0.3
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="View on GitHub" slotProps={tooltipSlotProps}>
            <Link
              href="https://github.com/jmynes/dream"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                },
                display: "flex",
                alignItems: "center",
              }}
            >
              <IconButton
                size="small"
                sx={{ padding: 0.5 }}
                component="span"
              >
                <i className="fab fa-github" style={{ fontSize: "1.2rem" }} />
              </IconButton>
            </Link>
          </Tooltip>
          <Tooltip title="Keyboard Shortcuts" slotProps={tooltipSlotProps}>
            <IconButton
              size="small"
              onClick={() => setOpen(true)}
              sx={{ padding: 0.5 }}
            >
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="sm" 
        fullWidth
        sx={{
          zIndex: 2100, // Higher than BrowserUI (2000) to ensure it's on top
          "& .MuiBackdrop-root": {
            zIndex: 2099, // Backdrop should be just below the dialog
          },
          "& .MuiDialog-container": {
            zIndex: 2100,
          },
          "& .MuiPaper-root": {
            zIndex: 2100, // Ensure paper is above BrowserUI
          },
        }}
        slotProps={{
          paper: {
            sx: {
              zIndex: 2100, // Higher than BrowserUI (2000) to ensure it's on top
            },
          },
          backdrop: {
            sx: {
              zIndex: 2099, // Backdrop should be just below the dialog
            },
          },
        }}
      >
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableBody>
              {shortcuts.map((shortcut) => (
                <TableRow key={shortcut.keys}>
                  <TableCell
                    sx={{
                      fontWeight: "medium",
                      fontFamily: "monospace",
                      width: "40%",
                    }}
                  >
                    {shortcut.keys}
                  </TableCell>
                  <TableCell>{shortcut.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </>
  );
}
