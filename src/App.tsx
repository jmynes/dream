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
	const [penColor, setPenColor] = useState("#000000");
	const [penSize, setPenSize] = useState(2);
	const [eraserSize, setEraserSize] = useState(15);
	const [isDrawing, setIsDrawing] = useState(true);
	const [isEraser, setIsEraser] = useState(false);
	const [isThinkingPen, setIsThinkingPen] = useState(false);
	const [snapToGrid, setSnapToGrid] = useState(true);
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
	const canvasImageDataRef = useRef<string | null>(null);
	const isUndoRedoRef = useRef(false);
	const historyRef = useRef(history);
	const historyIndexRef = useRef(0);

	// Keep refs in sync
	useEffect(() => {
		historyRef.current = history;
	}, [history]);
	useEffect(() => {
		historyIndexRef.current = historyIndex;
	}, [historyIndex]);

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
			const newHistory = prev.slice(0, historyIndex + 1);
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
	const handleCanvasStateChange = (imageData: string | null) => {
		if (isUndoRedoRef.current) {
			canvasImageDataRef.current = imageData;
			return;
		}
		canvasImageDataRef.current = imageData;
		saveHistory(components, imageData);
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
			setClearCanvasKey((prev) => prev + 1);
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
			setClearCanvasKey((prev) => prev + 1);
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
			saveHistory(comps, canvasImageDataRef.current);
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
					penColor={penColor}
					onPenColorChange={setPenColor}
					penSize={penSize}
					onPenSizeChange={setPenSize}
					isDrawing={isDrawing}
					onDrawingToggle={(drawing) => {
						setIsDrawing(drawing);
						if (drawing) {
							setSelectedComponentType(null);
							setIsEraser(false);
							setIsThinkingPen(false);
						}
					}}
					snapToGrid={snapToGrid}
					onSnapToGridToggle={setSnapToGrid}
					isEraser={isEraser}
					onEraserToggle={(eraser) => {
						setIsEraser(eraser);
						if (eraser) {
							setIsDrawing(false);
							setIsThinkingPen(false);
							setSelectedComponentType(null);
						}
					}}
					isThinkingPen={isThinkingPen}
					onThinkingPenToggle={(thinkingPen) => {
						setIsThinkingPen(thinkingPen);
						if (thinkingPen) {
							setIsDrawing(false);
							setIsEraser(false);
							setSelectedComponentType(null);
						}
					}}
					onDeleteEverything={handleDeleteEverything}
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
						onComponentSelect={handleComponentSelect}
						selectedComponentType={selectedComponentType}
					/>
					<Box sx={{ flex: 1, overflow: "hidden", display: "flex" }}>
					<Canvas
						key={clearCanvasKey}
						penColor={penColor}
						penSize={isEraser ? eraserSize : penSize}
						isDrawing={isDrawing}
						isEraser={isEraser}
						isThinkingPen={isThinkingPen}
						components={components}
						onComponentsChange={handleComponentsChange}
						onCanvasStateChange={handleCanvasStateChange}
						restoreCanvasImageData={canvasImageDataRef.current}
						selectedComponentType={selectedComponentType}
						onComponentPlaced={handleComponentPlaced}
						snapToGrid={snapToGrid}
					/>
					</Box>
					<RightSidebar />
				</Box>
				<Footer />
			</Box>
		</ThemeProvider>
	);
}

export default App;
