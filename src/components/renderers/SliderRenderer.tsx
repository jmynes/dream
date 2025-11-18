import { Box, Slider } from "@mui/material";
import { useColorUtils } from "../../contexts/ColorUtilsContext";
import type { RendererProps } from "./rendererTypes";

interface SliderRendererProps extends RendererProps {
  sliderDisplayValue: number;
  onSliderMouseDown: (e: React.MouseEvent) => void;
  onSliderMouseMove: (e: React.MouseEvent) => void;
  onSliderMouseUp: (e: React.MouseEvent) => void;
  onSliderChange: (
    event: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => void;
  onSliderChangeCommitted: (
    event: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => void;
}

export default function SliderRenderer({
  component,
  componentColor,
  sliderDisplayValue,
  onSliderMouseDown,
  onSliderMouseMove,
  onSliderMouseUp,
  onSliderChange,
  onSliderChangeCommitted,
}: SliderRendererProps) {
  const { isDarkColor } = useColorUtils();
  // Use CSS variable for live color updates, fallback to prop
  const sliderColor = `var(--live-component-color, ${componentColor})`;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        px: 2,
      }}
    >
      <Slider
        {...(component.props as object)}
        value={sliderDisplayValue}
        onMouseDown={onSliderMouseDown}
        onMouseMove={onSliderMouseMove}
        onMouseUp={onSliderMouseUp}
        onChange={onSliderChange}
        onChangeCommitted={onSliderChangeCommitted}
        sx={{
          width: "100%",
          color: sliderColor,
          "& .MuiSlider-thumb": {
            ...(isDarkColor(componentColor)
              ? {}
              : {
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }),
          },
          "& .MuiSlider-track": {
            ...(isDarkColor(componentColor)
              ? {}
              : {
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                }),
          },
          "& .MuiSlider-rail": {
            ...(isDarkColor(componentColor)
              ? {}
              : {
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                }),
          },
        }}
      />
    </Box>
  );
}
