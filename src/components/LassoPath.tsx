import type { Point } from "../utils/canvasUtils";

interface LassoPathProps {
  path: Point[];
  isActive: boolean;
}

export default function LassoPath({ path, isActive }: LassoPathProps) {
  if (!isActive || path.length < 2) {
    return null;
  }

  const pathData = path
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${point.x} ${point.y}`;
    })
    .join(" ");

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 4,
      }}
    >
      <path
        d={pathData}
        fill="rgba(25, 118, 210, 0.08)"
        stroke="#1976d2"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
    </svg>
  );
}

