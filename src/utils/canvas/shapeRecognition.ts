import type { ComponentType } from "../../types/component";
import { calculateAngle, type Point } from "./canvasUtils";

// Detect checkmark pattern - looks for characteristic checkmark shape
export function detectCheckmark(path: Point[]): boolean {
  if (path.length < 5) return false;

  // Calculate overall path characteristics
  const width =
    Math.max(...path.map((p) => p.x)) - Math.min(...path.map((p) => p.x));
  const height =
    Math.max(...path.map((p) => p.y)) - Math.min(...path.map((p) => p.y));
  const size = Math.max(width, height);

  // Checkmark should be small to medium sized (8-120px)
  if (size < 8 || size > 120) return false;

  const startPoint = path[0];
  const endPoint = path[path.length - 1];

  // Calculate angles for each segment
  const angles: number[] = [];
  for (let i = 1; i < path.length; i++) {
    const angle = calculateAngle(path[i - 1], path[i]);
    angles.push(angle);
  }

  // Look for significant direction changes (sharp turns)
  let directionChanges = 0;
  const turnThreshold = Math.PI / 4; // 45 degrees

  for (let i = 1; i < angles.length; i++) {
    const diff = Math.abs(angles[i] - angles[i - 1]);
    const normalizedDiff = Math.min(diff, 2 * Math.PI - diff);
    if (normalizedDiff > turnThreshold) {
      directionChanges++;
    }
  }

  // Checkmark should have 0-3 significant direction changes
  // (0 for a simple straight checkmark, 1-3 for curved ones)
  if (directionChanges > 3) return false;

  // Analyze the overall direction of movement
  const movesRight = endPoint.x > startPoint.x;

  // For a simple checkmark, we want it to move generally right (and possibly down)
  if (!movesRight) return false;

  // Calculate the main direction vectors
  const overallAngle = calculateAngle(startPoint, endPoint);

  // Typical checkmark angles:
  // - Down-right: π/4 (45°)
  // - Right: 0 (0°)
  // - Slightly down-right: 0 to π/3
  const isCheckmarkLikeAngle =
    overallAngle > -Math.PI / 6 && overallAngle < Math.PI / 2;

  // If it has the right general direction and size, likely a checkmark
  if (isCheckmarkLikeAngle) {
    // Additional check: aspect ratio should be reasonable for a checkmark
    const aspectRatio = width / Math.max(height, 1);
    if (aspectRatio > 0.3 && aspectRatio < 4) {
      return true;
    }
  }

  // Also check for simple V-like patterns
  // A checkmark typically has a turn from one direction to another
  if (directionChanges >= 1 && directionChanges <= 2) {
    const startAngle = angles[0];
    const endAngle = angles[angles.length - 1];

    // Check if start and end angles are different enough
    const angleDiff = Math.abs(endAngle - startAngle);
    const normalizedAngleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);

    // If there's a significant change in direction, could be a checkmark
    if (normalizedAngleDiff > Math.PI / 6) {
      // More than 30 degrees
      return true;
    }
  }

  return false;
}

// Detect square/box pattern - detects closed square shapes
export function detectSquare(path: Point[]): boolean {
  if (path.length < 8) return false;

  const width =
    Math.max(...path.map((p) => p.x)) - Math.min(...path.map((p) => p.x));
  const height =
    Math.max(...path.map((p) => p.y)) - Math.min(...path.map((p) => p.y));
  const size = Math.max(width, height);

  if (size < 10 || size > 100) return false;

  const aspectRatio =
    Math.max(width, height) / Math.min(Math.max(width, 1), Math.max(height, 1));

  // Check if roughly square
  if (aspectRatio < 0.6 || aspectRatio > 1.4) return false;

  // Check if path forms a closed shape (start and end are close)
  const startPoint = path[0];
  const endPoint = path[path.length - 1];
  const distanceFromEnd = Math.sqrt(
    (endPoint.x - startPoint.x) ** 2 + (endPoint.y - startPoint.y) ** 2,
  );

  // If start and end are close, it's likely a closed shape (box)
  if (distanceFromEnd < size * 0.3) {
    return true;
  }

  // Also check for rectangular patterns with 3-4 direction changes (corners)
  const angles: number[] = [];
  for (let i = 1; i < path.length; i++) {
    angles.push(calculateAngle(path[i - 1], path[i]));
  }

  let directionChanges = 0;
  for (let i = 1; i < angles.length; i++) {
    const diff = Math.abs(angles[i] - angles[i - 1]);
    const normalizedDiff = Math.min(diff, 2 * Math.PI - diff);
    if (normalizedDiff > Math.PI / 3) {
      // More than 60 degree turn
      directionChanges++;
    }
  }

  // Square should have 3-4 direction changes (corners)
  if (directionChanges >= 3 && directionChanges <= 5) {
    return true;
  }

  return false;
}

// Recognize shape from path points
export function recognizeShape(path: Point[]): ComponentType | null {
  if (path.length < 3) return null;

  // Calculate bounding box
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const point of path) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const size = Math.max(width, height);
  const aspectRatio =
    Math.max(width, height) / Math.min(Math.max(width, 1), Math.max(height, 1));

  // PRIORITY 1: Check for checkmark pattern FIRST
  // This is highest priority to avoid false positives
  if (size < 120 && detectCheckmark(path)) {
    return "Checkbox";
  }

  // PRIORITY 2: Check for square/box pattern (with or without check inside)
  if (size < 100 && detectSquare(path)) {
    return "Checkbox";
  }

  // PRIORITY 3: Check for small square (checkbox) - small size, roughly square
  if (width < 60 && height < 60 && aspectRatio > 0.7 && aspectRatio < 1.3) {
    return "Checkbox";
  }

  // PRIORITY 4: Check for horizontal line (divider) - long horizontal line
  if (width > 100 && height < 20 && width / height > 5) {
    return "Divider";
  }

  // PRIORITY 5: Check for vertical line (divider) - long vertical line
  if (height > 100 && width < 20 && height / width > 5) {
    return "Divider";
  }

  // PRIORITY 6: Check for circle (avatar) - ONLY if clearly circular and NOT small
  // Make this more strict to avoid false positives
  if (width > 40 && height > 40 && aspectRatio > 0.8 && aspectRatio < 1.2) {
    // Calculate average distance from center
    let totalDistance = 0;
    for (const point of path) {
      const dx = point.x - centerX;
      const dy = point.y - centerY;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
    const avgDistance = totalDistance / path.length;
    const radius = Math.max(width, height) / 2;

    // Must be clearly circular (tighter threshold)
    if (Math.abs(avgDistance - radius) / radius < 0.2) {
      // Check if path forms a closed shape (circle)
      const startPoint = path[0];
      const endPoint = path[path.length - 1];
      const distanceFromEnd = Math.sqrt(
        (endPoint.x - startPoint.x) ** 2 + (endPoint.y - startPoint.y) ** 2,
      );

      // Circle should be closed (start and end are close)
      if (distanceFromEnd < radius * 0.3) {
        return "Avatar";
      }
    }
  }

  // PRIORITY 7: Check for rectangle (button, card, textfield)
  // Make this only apply to larger, clearly rectangular shapes
  if (width > 80 && height > 40 && aspectRatio < 0.6) {
    // Very tall rectangle
    return "Button";
  }
  if (width > 150 && height > 40 && aspectRatio > 2) {
    // Very wide rectangle - likely card
    return "Card";
  }
  if (width > 80 && height > 30 && aspectRatio > 1.5 && aspectRatio < 3) {
    // Medium-wide rectangle
    return "Button";
  }

  return null;
}
