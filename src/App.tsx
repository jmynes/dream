import { Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
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
	const [isDrawing, setIsDrawing] = useState(true);
	const [isEraser, setIsEraser] = useState(false);
	const [snapToGrid, setSnapToGrid] = useState(true);
	const [components, setComponents] = useState<CanvasComponent[]>([]);
	const [selectedComponentType, setSelectedComponentType] =
		useState<ComponentType | null>(null);

	const handleComponentSelect = (type: ComponentType) => {
		setSelectedComponentType(type);
		setIsDrawing(false);
	};

	const handleComponentPlaced = () => {
		setSelectedComponentType(null);
	};

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
						}
					}}
					snapToGrid={snapToGrid}
					onSnapToGridToggle={setSnapToGrid}
					isEraser={isEraser}
					onEraserToggle={(eraser) => {
						setIsEraser(eraser);
						if (eraser) {
							setIsDrawing(false);
							setSelectedComponentType(null);
						}
					}}
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
							penColor={penColor}
							penSize={penSize}
							isDrawing={isDrawing}
							isEraser={isEraser}
							components={components}
							onComponentsChange={setComponents}
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
