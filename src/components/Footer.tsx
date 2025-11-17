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
} from "@mui/material";
import { Help as HelpIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";

export default function Footer() {
  const [open, setOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const shortcuts = [
    { keys: "?", description: "Open keyboard shortcuts help" },
    { keys: "Ctrl/Cmd + A", description: "Select all components" },
    { keys: "Ctrl/Cmd + C", description: "Copy selected components" },
    { keys: "Ctrl/Cmd + V", description: "Paste components" },
    { keys: "Delete / Backspace", description: "Delete selected components" },
    { keys: "Arrow Keys", description: "Move selected components (1 grid cell)" },
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
          © {currentYear}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setOpen(true)}
            sx={{ padding: 0.5 }}
          >
            <HelpIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
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
