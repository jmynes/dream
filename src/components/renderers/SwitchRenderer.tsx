import { Box, Switch } from "@mui/material";
import type { RendererProps } from "./rendererTypes";
import { isDarkColor } from "./rendererUtils";

export default function SwitchRenderer({
  component,
  componentColor,
}: RendererProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Switch
        {...(component.props as object)}
        defaultChecked={component.props?.checked as boolean}
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": { color: componentColor },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { 
            backgroundColor: componentColor,
            ...(isDarkColor(componentColor) ? {} : {
              boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.2)",
            }),
          },
          "& .MuiSwitch-thumb": {
            ...(isDarkColor(componentColor) ? {} : {
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }),
          },
        }}
      />
    </Box>
  );
}

