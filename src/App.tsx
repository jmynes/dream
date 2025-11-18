import { Box, Snackbar } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import Canvas from "./components/Canvas";
import Footer from "./components/Footer";
import ComponentsDrawer from "./components/ComponentsDrawer";
import ToolsDrawer from "./components/ToolsDrawer";
import MenuBar from "./components/MenuBar";
import { ColorUtilsProvider } from "./contexts/ColorUtilsContext";
import type { CanvasComponent, ComponentType } from "./types/component";

const theme = createTheme({
  palette: {
    mode: "light",
  },
  zIndex: {
    modal: 2100, // Higher than BrowserUI (2000) so dialogs appear above it
  },
  components: {
    // Disable color-related transitions on all MUI components for instant color changes
    MuiButton: {
      styleOverrides: {
        root: {
          transition: "none !important",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: "none !important",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          transition: "none !important",
          "& .MuiSvgIcon-root": {
            transition: "none !important",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          transition: "none !important",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          transition: "none !important",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          transition: "none !important",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          transition: "none !important",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: "none !important",
        },
      },
    },
    MuiBox: {
      styleOverrides: {
        root: {
          transition: "none !important",
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          transition: "none !important",
          "& .MuiSvgIcon-root": {
            transition: "none !important",
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          transition: "none !important",
          "& .MuiSlider-thumb": {
            transition: "none !important",
          },
          "& .MuiSlider-track": {
            transition: "none !important",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          transition: "none !important",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          transition: "none !important",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          transition: "none !important",
        },
      },
    },
  },
});

function App() {
  const [penColor, setPenColor] = useState("#1976d2");
  const [componentColor, setComponentColor] = useState("#1976d2");
  const [componentColorTimestamp, setComponentColorTimestamp] = useState(0);
  const [canvasColor, setCanvasColor] = useState("#ffffff");
  const [penSize, setPenSize] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [isMagicWand, setIsMagicWand] = useState(false);
  const [isLasso, setIsLasso] = useState(false);
  const [isTextSelectMode, setIsTextSelectMode] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [resizeMode, setResizeMode] = useState<"relative" | "match">(
    "relative",
  );
  const [showTitleBar, setShowTitleBar] = useState(true);
  const [showUrlBar, setShowUrlBar] = useState(true);
  const [showBookmarkBar, setShowBookmarkBar] = useState(true);
  const [isBrowserUIEnabled, setIsBrowserUIEnabled] = useState(false);
  const [isMacOSStyle, setIsMacOSStyle] = useState(false);
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [selectedComponentType, setSelectedComponentType] =
    useState<ComponentType | null>(null);
  const [clearCanvasKey, setClearCanvasKey] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Undo/Redo history
  interface HistoryState {
    components: CanvasComponent[];
    canvasImageData: string | null; // Base64 encoded image data
  }
  const [history, setHistory] = useState<HistoryState[]>([
    { components: [], canvasImageData: null },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [restoreCanvasImageData, setRestoreCanvasImageData] = useState<
    string | null
  >(null);
  const canvasImageDataRef = useRef<string | null>(null);
  const componentsRef = useRef<CanvasComponent[]>([]);
  const isUndoRedoRef = useRef(false);
  const historyRef = useRef(history);
  const historyIndexRef = useRef(0);
  const pendingSaveRef = useRef<{
    components: CanvasComponent[];
    imageData: string | null;
  } | null>(null);

  // Keep refs in sync
  useEffect(() => {
    historyRef.current = history;
  }, [history]);
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);
  useEffect(() => {
    componentsRef.current = components;
  }, [components]);

  const handleComponentSelect = (type: ComponentType) => {
    setSelectedComponentType(type);
    setIsDrawing(false);
    setIsTextSelectMode(false);
  };

  const handleComponentPlaced = () => {
    setSelectedComponentType(null);
  };

  const handleDeleteEverything = () => {
    setComponents([]);
    setClearCanvasKey((prev) => prev + 1);
    saveHistory([], null);
  };

  // Save current state to history
  const saveHistory = (comps: CanvasComponent[], imageData: string | null) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    setHistory((prev) => {
      const currentIndex = historyIndexRef.current;
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({ components: comps, canvasImageData: imageData });
      // Limit history to 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex >= 50 ? 49 : newIndex;
    });
  };

  // Handle canvas state update
  // This is only called when canvas drawing changes, not when components change
  const handleCanvasStateChange = (imageData: string | null) => {
    if (isUndoRedoRef.current) {
      canvasImageDataRef.current = imageData;
      return;
    }
    canvasImageDataRef.current = imageData;
    // Update pending save if there is one (to batch component + canvas changes)
    if (pendingSaveRef.current) {
      pendingSaveRef.current.imageData = imageData;
    } else {
      // Only save history if this is a real canvas change (drawing/erasing), not just component placement
      // Component changes are handled separately in handleComponentsChange
      saveHistory(componentsRef.current, imageData);
    }
  };

  // Undo function
  const handleUndo = useCallback(() => {
    const currentIndex = historyIndexRef.current;
    const hist = historyRef.current;
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const state = hist[newIndex];
      isUndoRedoRef.current = true;
      setHistoryIndex(newIndex);
      setComponents([...state.components]);
      canvasImageDataRef.current = state.canvasImageData;
      setRestoreCanvasImageData(state.canvasImageData);
      setToastMessage("Action undone (Ctrl + Z / Cmd + Z)");
      // Reset the flag after a short delay to allow state updates
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 100);
    } else {
      setToastMessage("Nothing to undo");
    }
  }, []);

  // Redo function
  const handleRedo = useCallback(() => {
    const currentIndex = historyIndexRef.current;
    const hist = historyRef.current;
    if (currentIndex < hist.length - 1) {
      const newIndex = currentIndex + 1;
      const state = hist[newIndex];
      isUndoRedoRef.current = true;
      setHistoryIndex(newIndex);
      setComponents([...state.components]);
      canvasImageDataRef.current = state.canvasImageData;
      setRestoreCanvasImageData(state.canvasImageData);
      setToastMessage("Action redone (Ctrl + Y / Cmd + Y)");
      // Reset the flag after a short delay to allow state updates
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 100);
    } else {
      setToastMessage("Nothing to redo");
    }
  }, []);

  // Track component changes for history
  const handleComponentsChange = (comps: CanvasComponent[]) => {
    setComponents(comps);
    if (!isUndoRedoRef.current) {
      // Defer save to batch with potential canvas state change
      // This prevents double saves when component and canvas change together
      pendingSaveRef.current = {
        components: comps,
        imageData: canvasImageDataRef.current,
      };
      setTimeout(() => {
        if (pendingSaveRef.current) {
          const { components: pendingComps, imageData: pendingImageData } =
            pendingSaveRef.current;
          // Only save if we're still not in undo/redo mode
          if (!isUndoRedoRef.current) {
            saveHistory(pendingComps, pendingImageData);
          }
          pendingSaveRef.current = null;
        }
      }, 0);
    }
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  return (
    <ColorUtilsProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <MenuBar
          onDeleteEverything={handleDeleteEverything}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />

        <Box
          sx={{
            flex: 1,
            display: "flex",
            gap: 2,
            p: 2,
            overflow: "hidden",
          }}
        >
          <ToolsDrawer
            penColor={penColor}
            onPenColorChange={setPenColor}
            componentColor={componentColor}
            onComponentColorChange={(color, timestamp) => {
              setComponentColor(color);
              if (timestamp !== undefined) {
                setComponentColorTimestamp(timestamp);
              }
            }}
            canvasColor={canvasColor}
            onCanvasColorChange={setCanvasColor}
            penSize={penSize}
            onPenSizeChange={setPenSize}
            isDrawing={isDrawing}
            onDrawingToggle={(drawing) => {
              setIsDrawing(drawing);
              if (drawing) {
                setSelectedComponentType(null);
                setIsEraser(false);
                setIsMagicWand(false);
                setIsLasso(false);
                setIsTextSelectMode(false);
              }
            }}
            snapToGrid={snapToGrid}
            onSnapToGridToggle={setSnapToGrid}
            isEraser={isEraser}
            onEraserToggle={(eraser) => {
              setIsEraser(eraser);
              if (eraser) {
                setIsDrawing(false);
                setIsMagicWand(false);
                setIsLasso(false);
                setSelectedComponentType(null);
                setIsTextSelectMode(false);
              }
            }}
            isMagicWand={isMagicWand}
            onMagicWandToggle={(magicWand) => {
              setIsMagicWand(magicWand);
              if (magicWand) {
                setIsDrawing(false);
                setIsEraser(false);
                setIsLasso(false);
                setSelectedComponentType(null);
                setIsTextSelectMode(false);
              }
            }}
            isLasso={isLasso}
            onLassoToggle={(lasso) => {
              setIsLasso(lasso);
              if (lasso) {
                setIsDrawing(false);
                setIsEraser(false);
                setIsMagicWand(false);
                setSelectedComponentType(null);
                setIsTextSelectMode(false);
              }
            }}
            onCursorMode={() => {
              setIsDrawing(false);
              setIsEraser(false);
              setIsMagicWand(false);
              setIsLasso(false);
              setSelectedComponentType(null);
              setIsTextSelectMode(false);
            }}
            isCursorMode={
              !isDrawing &&
              !isEraser &&
              !isMagicWand &&
              !isLasso &&
              !isTextSelectMode &&
              !selectedComponentType
            }
            isTextSelectMode={isTextSelectMode}
            onTextSelectToggle={(next) => {
              setIsTextSelectMode(next);
              if (next) {
                setIsDrawing(false);
                setIsEraser(false);
                setIsMagicWand(false);
                setIsLasso(false);
                setSelectedComponentType(null);
              }
            }}
            resizeMode={resizeMode}
            onResizeModeChange={setResizeMode}
            showTitleBar={showTitleBar}
            onTitleBarToggle={setShowTitleBar}
            showUrlBar={showUrlBar}
            onUrlBarToggle={setShowUrlBar}
            showBookmarkBar={showBookmarkBar}
            onBookmarkBarToggle={setShowBookmarkBar}
            isBrowserUIEnabled={isBrowserUIEnabled}
            onBrowserUIEnabledToggle={setIsBrowserUIEnabled}
            isMacOSStyle={isMacOSStyle}
            onMacOSStyleToggle={setIsMacOSStyle}
          />
          <Box sx={{ flex: 1, overflow: "hidden", display: "flex" }}>
            <Canvas
              key={clearCanvasKey}
              penColor={penColor}
              componentColor={componentColor}
              componentColorTimestamp={componentColorTimestamp}
              penSize={penSize}
              isDrawing={isDrawing}
              isEraser={isEraser}
              isMagicWand={isMagicWand}
              isLasso={isLasso}
              components={components}
              onComponentsChange={handleComponentsChange}
              onCanvasStateChange={handleCanvasStateChange}
              restoreCanvasImageData={restoreCanvasImageData}
              selectedComponentType={selectedComponentType}
              onComponentPlaced={handleComponentPlaced}
              snapToGrid={snapToGrid}
              showTitleBar={showTitleBar}
              showUrlBar={showUrlBar}
              showBookmarkBar={showBookmarkBar}
              isBrowserUIEnabled={isBrowserUIEnabled}
              isMacOSStyle={isMacOSStyle}
              canvasColor={canvasColor}
              resizeMode={resizeMode}
              isTextSelectMode={isTextSelectMode}
              onResetTools={() => {
                setIsDrawing(false);
                setIsEraser(false);
                setIsMagicWand(false);
                setIsLasso(false);
                setSelectedComponentType(null);
                setIsTextSelectMode(false);
              }}
            />
          </Box>
          <ComponentsDrawer
            onComponentSelect={handleComponentSelect}
            selectedComponentType={selectedComponentType}
            componentColor={componentColor}
          />
        </Box>
        <Footer />
      </Box>
      {/* Toast notification */}
      <Snackbar
        open={toastMessage !== null}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
      </ThemeProvider>
    </ColorUtilsProvider>
  );
}

export default App;
