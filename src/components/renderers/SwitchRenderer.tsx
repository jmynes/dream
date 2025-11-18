import { Box, Switch } from "@mui/material";
import { useColorUtils } from "../../contexts/ColorUtilsContext";
import type { RendererProps } from "./rendererTypes";

export default function SwitchRenderer({
  component,
  componentColor,
}: RendererProps) {
  const { isDarkColor } = useColorUtils();
  // Use CSS variable for live color updates, fallback to prop
  const switchColor = `var(--live-component-color, ${componentColor})`;

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
          "& .MuiSwitch-switchBase.Mui-checked": { color: switchColor },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: switchColor,
            ...(isDarkColor(componentColor)
              ? {}
              : {
                  boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.2)",
                }),
          },
          "& .MuiSwitch-thumb": {
            ...(isDarkColor(componentColor)
              ? {}
              : {
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }),
          },
        }}
      />
    </Box>
  );
}
