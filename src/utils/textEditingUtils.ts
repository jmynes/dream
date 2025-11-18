import type { CanvasComponent } from "../types/component";

// Component types that support text editing
export const TEXT_EDITABLE_TYPES = [
  "Button",
  "Card",
  "Typography",
  "Avatar",
  "Paper",
  "Box",
  "Radio",
  "Table",
  "TextField",
  "Chip",
  "Checkbox",
] as const;

/**
 * Check if component type supports text editing
 */
export function canEditText(componentType: string): boolean {
  return TEXT_EDITABLE_TYPES.includes(componentType as any);
}

/**
 * Get field name and current text for a component type
 */
export function getComponentTextInfo(
  componentType: string,
  props: CanvasComponent["props"],
  dataField?: string | null,
): { field: string; currentText: string } {
  if (componentType === "Radio") {
    const field = dataField === "radio2" ? "radio2" : "radio1";
    const currentText =
      (props?.[field === "radio2" ? "label2" : "label"] as string) ||
      (field === "radio2" ? "Option 2" : "Option 1");
    return { field, currentText };
  }

  if (componentType === "Table") {
    if (dataField) {
      const fieldMap: Record<string, string> = {
        header1: (props?.header1 as string) || "Header 1",
        header2: (props?.header2 as string) || "Header 2",
        header3: (props?.header3 as string) || "Header 3",
        cell1_1: (props?.cell1_1 as string) || "Cell 1-1",
        cell1_2: (props?.cell1_2 as string) || "Cell 1-2",
        cell1_3: (props?.cell1_3 as string) || "Cell 1-3",
        cell2_1: (props?.cell2_1 as string) || "Cell 2-1",
        cell2_2: (props?.cell2_2 as string) || "Cell 2-2",
        cell2_3: (props?.cell2_3 as string) || "Cell 2-3",
      };
      return { field: dataField, currentText: fieldMap[dataField] || "" };
    }
    return {
      field: "header1",
      currentText: (props?.header1 as string) || "Header 1",
    };
  }

  if (componentType === "TextField") {
    return { field: "value", currentText: (props?.value as string) || "" };
  }

  if (componentType === "Chip") {
    return { field: "label", currentText: (props?.label as string) || "Chip" };
  }

  if (componentType === "Checkbox") {
    return {
      field: "label",
      currentText: (props?.label as string) || "Checkbox",
    };
  }

  // Default: text field
  return { field: "text", currentText: (props?.text as string) || "" };
}

/**
 * Get update props for a component type and field
 */
export function getUpdateProps(
  componentType: string,
  field: string,
  value: string,
): Record<string, unknown> {
  if (componentType === "Radio") {
    if (field === "radio2") {
      return { label2: value };
    }
    return { label: value };
  }

  if (componentType === "Table") {
    return { [field]: value };
  }

  if (componentType === "TextField") {
    return { value };
  }

  if (componentType === "Chip" || componentType === "Checkbox") {
    return { label: value };
  }

  return { text: value };
}

