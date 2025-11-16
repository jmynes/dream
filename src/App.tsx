import { Box, Container, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";

const theme = createTheme({
	palette: {
		mode: "light",
	},
});

function App() {
	const [penColor, setPenColor] = useState("#000000");
	const [penSize, setPenSize] = useState(2);
	const [isDrawing, setIsDrawing] = useState(true);

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
						onDrawingToggle={setIsDrawing}
					/>

					<Box sx={{ mt: 2 }}>
						<Canvas
							width={1200}
							height={800}
							penColor={penColor}
							penSize={penSize}
							isDrawing={isDrawing}
						/>
					</Box>
				</Box>
			</Container>
		</ThemeProvider>
	);
}

export default App;
