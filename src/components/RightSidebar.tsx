import { Paper, Typography } from "@mui/material";

export default function RightSidebar() {
	return (
		<Paper
			sx={{
				width: 250,
				height: "100%",
				padding: 2,
				borderRadius: 1,
				overflow: "auto",
			}}
		>
			<Typography variant="h6" gutterBottom>
				Properties
			</Typography>
		</Paper>
	);
}

