import { useEffect, useRef } from "react";
import type { Point } from "../utils/canvasUtils";

interface SelectionBoxProps {
  start: Point | null;
  end: Point | null;
  endRef?: React.MutableRefObject<Point | null>;
}

export default function SelectionBox({ start, end, endRef }: SelectionBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startRef = useRef<Point | null>(start);
  const isActiveRef = useRef(false);

  // Keep refs in sync with props
  startRef.current = start;
  isActiveRef.current = !!(start && (endRef?.current || end));

  useEffect(() => {
    // Cancel any existing animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const box = boxRef.current;
    if (!box) return;

    // If we have a ref, use requestAnimationFrame for smooth updates
    if (endRef && start && endRef.current) {
      isActiveRef.current = true;

      const animate = () => {
        // Check if we should continue (using refs to avoid closure issues)
        if (!isActiveRef.current || !startRef.current || !endRef.current) {
          animationFrameRef.current = null;
          if (box) {
            box.style.display = "none";
          }
          return;
        }

        const currentStart = startRef.current;
        const currentEnd = endRef.current;

        // Update box position
        const minX = Math.min(currentStart.x, currentEnd.x);
        const minY = Math.min(currentStart.y, currentEnd.y);
        const width = Math.abs(currentEnd.x - currentStart.x);
        const height = Math.abs(currentEnd.y - currentStart.y);

        box.style.display = "block";
        box.style.left = `${minX}px`;
        box.style.top = `${minY}px`;
        box.style.width = `${width}px`;
        box.style.height = `${height}px`;

        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
      
      return () => {
        isActiveRef.current = false;
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (box) {
          box.style.display = "none";
        }
      };
    } else {
      // Fallback to state-based updates or hide if inactive
      if (!start || !(endRef?.current || end)) {
        box.style.display = "none";
        isActiveRef.current = false;
      } else {
        const currentEnd = endRef?.current || end;
        if (!currentEnd) {
          box.style.display = "none";
          isActiveRef.current = false;
          return;
        }
        const minX = Math.min(start.x, currentEnd.x);
        const minY = Math.min(start.y, currentEnd.y);
        const width = Math.abs(currentEnd.x - start.x);
        const height = Math.abs(currentEnd.y - start.y);

        box.style.display = "block";
        box.style.left = `${minX}px`;
        box.style.top = `${minY}px`;
        box.style.width = `${width}px`;
        box.style.height = `${height}px`;
      }
    }
  }, [start, end, endRef]);

  return (
    <div
      ref={boxRef}
      style={{
        position: "absolute",
        border: "2px dashed #1976d2",
        backgroundColor: "rgba(25, 118, 210, 0.1)",
        pointerEvents: "none",
        zIndex: 4,
        display: "none", // Controlled by useEffect
      }}
    />
  );
}
