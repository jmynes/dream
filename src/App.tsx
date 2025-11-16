import { Box, Container, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import Canvas from "./components/Canvas";
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
			<Container maxWidth="xl" sx={{ py: 3 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					Canvas Web Builder
				</Typography>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Draw UI elements on the canvas to build your website
				</Typography>

				<Box sx={{ mt: 3 }}>
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
							mt: 2,
							display: "flex",
							gap: 2,
						}}
					>
						<Sidebar
							onComponentSelect={handleComponentSelect}
							selectedComponentType={selectedComponentType}
						/>
						<Box sx={{ flex: 1 }}>
							<Canvas
								width={1200}
								height={800}
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
					</Box>
				</Box>
			</Container>
		</ThemeProvider>
	);
}

export default App;
