import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import type { RendererProps } from "./rendererTypes";
import { inlineInputStyle } from "./rendererUtils";

interface TableRendererProps extends RendererProps {
  onCellDoubleClick: (field: string, currentText: string) => void;
}

const TableCellContent = ({
  field,
  component,
  isEditing,
  editingField,
  editValue,
  inputRef,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
  isHeader = false,
}: {
  field: string;
  component: RendererProps["component"];
  isEditing: boolean;
  editingField: string;
  editValue: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onEditChange: (value: string) => void;
  onEditBlur: () => void;
  onEditKeyDown: (e: React.KeyboardEvent) => void;
  isHeader?: boolean;
}) => {
  const fieldMap: Record<string, string> = {
    header1: (component.props?.header1 as string) || "Header 1",
    header2: (component.props?.header2 as string) || "Header 2",
    header3: (component.props?.header3 as string) || "Header 3",
    cell1_1: (component.props?.cell1_1 as string) || "Cell 1-1",
    cell1_2: (component.props?.cell1_2 as string) || "Cell 1-2",
    cell1_3: (component.props?.cell1_3 as string) || "Cell 1-3",
    cell2_1: (component.props?.cell2_1 as string) || "Cell 2-1",
    cell2_2: (component.props?.cell2_2 as string) || "Cell 2-2",
    cell2_3: (component.props?.cell2_3 as string) || "Cell 2-3",
  };

  const currentText = fieldMap[field] || "";

  return (
    <>
      {isEditing && editingField === field ? (
        <Box sx={{ textAlign: "center", width: "100%" }}>
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={onEditBlur}
            onKeyDown={onEditKeyDown}
            onClick={(e) => e.stopPropagation()}
            style={{
              ...inlineInputStyle,
              textAlign: "center",
              ...(isHeader ? { fontWeight: "bold" } : {}),
            }}
          />
        </Box>
      ) : (
        currentText
      )}
    </>
  );
};

export default function TableRenderer({
  component,
  componentColor,
  isEditing,
  editingField,
  editValue,
  inputRef,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
  onCellDoubleClick,
}: TableRendererProps) {
  const fieldMap: Record<string, string> = {
    header1: (component.props?.header1 as string) || "Header 1",
    header2: (component.props?.header2 as string) || "Header 2",
    header3: (component.props?.header3 as string) || "Header 3",
    cell1_1: (component.props?.cell1_1 as string) || "Cell 1-1",
    cell1_2: (component.props?.cell1_2 as string) || "Cell 1-2",
    cell1_3: (component.props?.cell1_3 as string) || "Cell 1-3",
    cell2_1: (component.props?.cell2_1 as string) || "Cell 2-1",
    cell2_2: (component.props?.cell2_2 as string) || "Cell 2-2",
    cell2_3: (component.props?.cell2_3 as string) || "Cell 2-3",
  };

  const handleCellDoubleClick = (field: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentText = fieldMap[field] || "";
    onCellDoubleClick(field, currentText);
  };

  return (
    <TableContainer
      sx={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Table size="small" sx={{ border: `1px solid ${componentColor}`, tableLayout: "fixed", width: "100%" }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ borderColor: componentColor, fontWeight: "bold", textAlign: "center" }}
              data-field="header1"
              onDoubleClick={(e) => handleCellDoubleClick("header1", e)}
            >
              <TableCellContent
                field="header1"
                component={component}
                isEditing={isEditing}
                editingField={editingField}
                editValue={editValue}
                inputRef={inputRef}
                onEditChange={onEditChange}
                onEditBlur={onEditBlur}
                onEditKeyDown={onEditKeyDown}
                isHeader
              />
            </TableCell>
            <TableCell
              sx={{ borderColor: componentColor, fontWeight: "bold", textAlign: "center" }}
              data-field="header2"
              onDoubleClick={(e) => handleCellDoubleClick("header2", e)}
            >
              <TableCellContent
                field="header2"
                component={component}
                isEditing={isEditing}
                editingField={editingField}
                editValue={editValue}
                inputRef={inputRef}
                onEditChange={onEditChange}
                onEditBlur={onEditBlur}
                onEditKeyDown={onEditKeyDown}
                isHeader
              />
            </TableCell>
            <TableCell
              sx={{ borderColor: componentColor, fontWeight: "bold", textAlign: "center" }}
              data-field="header3"
              onDoubleClick={(e) => handleCellDoubleClick("header3", e)}
            >
              <TableCellContent
                field="header3"
                component={component}
                isEditing={isEditing}
                editingField={editingField}
                editValue={editValue}
                inputRef={inputRef}
                onEditChange={onEditChange}
                onEditBlur={onEditBlur}
                onEditKeyDown={onEditKeyDown}
                isHeader
              />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell
              sx={{ borderColor: componentColor, textAlign: "center" }}
              data-field="cell1_1"
              onDoubleClick={(e) => handleCellDoubleClick("cell1_1", e)}
            >
              <TableCellContent
                field="cell1_1"
                component={component}
                isEditing={isEditing}
                editingField={editingField}
                editValue={editValue}
                inputRef={inputRef}
                onEditChange={onEditChange}
                onEditBlur={onEditBlur}
                onEditKeyDown={onEditKeyDown}
              />
            </TableCell>
            <TableCell
              sx={{ borderColor: componentColor, textAlign: "center" }}
              data-field="cell1_2"
              onDoubleClick={(e) => handleCellDoubleClick("cell1_2", e)}
            >
              <TableCellContent
                field="cell1_2"
                component={component}
                isEditing={isEditing}
                editingField={editingField}
                editValue={editValue}
                inputRef={inputRef}
                onEditChange={onEditChange}
                onEditBlur={onEditBlur}
                onEditKeyDown={onEditKeyDown}
              />
            </TableCell>
            <TableCell
              sx={{ borderColor: componentColor, textAlign: "center" }}
              data-field="cell1_3"
              onDoubleClick={(e) => handleCellDoubleClick("cell1_3", e)}
            >
              <TableCellContent
                field="cell1_3"
                component={component}
                isEditing={isEditing}
                editingField={editingField}
                editValue={editValue}
                inputRef={inputRef}
                onEditChange={onEditChange}
                onEditBlur={onEditBlur}
                onEditKeyDown={onEditKeyDown}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              sx={{ borderColor: componentColor, textAlign: "center" }}
              data-field="cell2_1"
              onDoubleClick={(e) => handleCellDoubleClick("cell2_1", e)}
            >
              <TableCellContent
                field="cell2_1"
                component={component}
                isEditing={isEditing}
                editingField={editingField}
                editValue={editValue}
                inputRef={inputRef}
                onEditChange={onEditChange}
                onEditBlur={onEditBlur}
                onEditKeyDown={onEditKeyDown}
              />
            </TableCell>
            <TableCell
              sx={{ borderColor: componentColor, textAlign: "center" }}
              data-field="cell2_2"
              onDoubleClick={(e) => handleCellDoubleClick("cell2_2", e)}
            >
              <TableCellContent
                field="cell2_2"
                component={component}
                isEditing={isEditing}
                editingField={editingField}
                editValue={editValue}
                inputRef={inputRef}
                onEditChange={onEditChange}
                onEditBlur={onEditBlur}
                onEditKeyDown={onEditKeyDown}
              />
            </TableCell>
            <TableCell
              sx={{ borderColor: componentColor, textAlign: "center" }}
              data-field="cell2_3"
              onDoubleClick={(e) => handleCellDoubleClick("cell2_3", e)}
            >
              <TableCellContent
                field="cell2_3"
                component={component}
                isEditing={isEditing}
                editingField={editingField}
                editValue={editValue}
                inputRef={inputRef}
                onEditChange={onEditChange}
                onEditBlur={onEditBlur}
                onEditKeyDown={onEditKeyDown}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

