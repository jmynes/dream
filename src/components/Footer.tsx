import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        borderTop: "1px solid #e0e0e0",
        backgroundColor: "#f5f5f5",
        padding: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Footer
      </Typography>
    </Box>
  );
}
