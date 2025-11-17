import { Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import Canvas from "./components/Canvas";
import Footer from "./components/Footer";
import RightSidebar from "./components/RightSidebar";
import Sidebar from "./components/Sidebar";
import Toolbar from "./components/Toolbar";
import type { CanvasComponent, ComponentType } from "./types/component";

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

function App() {
  const [penColor, setPenColor] = useState("#1976d2");
  const [componentColor, setComponentColor] = useState("#1976d2");
  const [penSize, setPenSize] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [isMagicWand, setIsMagicWand] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [resizeMode, setResizeMode] = useState<"relative" | "clone">(
    "relative",
  );
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [selectedComponentType, setSelectedComponentType] =
    useState<ComponentType | null>(null);
  const [clearCanvasKey, setClearCanvasKey] = useState(0);

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
      // Reset the flag after a short delay to allow state updates
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 100);
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
      // Reset the flag after a short delay to allow state updates
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 100);
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
        <Toolbar
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
          <Sidebar
            penColor={penColor}
            onPenColorChange={setPenColor}
            componentColor={componentColor}
            onComponentColorChange={setComponentColor}
            penSize={penSize}
            onPenSizeChange={setPenSize}
            isDrawing={isDrawing}
            onDrawingToggle={(drawing) => {
              setIsDrawing(drawing);
              if (drawing) {
                setSelectedComponentType(null);
                setIsEraser(false);
                setIsMagicWand(false);
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
                setSelectedComponentType(null);
              }
            }}
            isMagicWand={isMagicWand}
            onMagicWandToggle={(magicWand) => {
              setIsMagicWand(magicWand);
              if (magicWand) {
                setIsDrawing(false);
                setIsEraser(false);
                setSelectedComponentType(null);
              }
            }}
            onCursorMode={() => {
              setIsDrawing(false);
              setIsEraser(false);
              setIsMagicWand(false);
              setSelectedComponentType(null);
            }}
            isCursorMode={!isDrawing && !isEraser && !isMagicWand}
            resizeMode={resizeMode}
            onResizeModeChange={setResizeMode}
          />
          <Box sx={{ flex: 1, overflow: "hidden", display: "flex" }}>
            <Canvas
              key={clearCanvasKey}
              penColor={penColor}
              componentColor={componentColor}
              penSize={penSize}
              isDrawing={isDrawing}
              isEraser={isEraser}
              isMagicWand={isMagicWand}
              components={components}
              onComponentsChange={handleComponentsChange}
              onCanvasStateChange={handleCanvasStateChange}
              restoreCanvasImageData={restoreCanvasImageData}
              selectedComponentType={selectedComponentType}
              onComponentPlaced={handleComponentPlaced}
              snapToGrid={snapToGrid}
              resizeMode={resizeMode}
            />
          </Box>
          <RightSidebar
            onComponentSelect={handleComponentSelect}
            selectedComponentType={selectedComponentType}
            componentColor={componentColor}
          />
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
