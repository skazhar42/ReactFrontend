import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import CollegeAutocompleteEditor from "./CollegeAutocompleteEditor";

import { IconButton, Box, Switch } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

// Define row type
interface Student {
  name: string;
  college: string;
  age: number;
  isPresent: boolean;
}

ModuleRegistry.registerModules([AllCommunityModule]);

// 👉 Custom Age Renderer with MUI buttons
const AgeRenderer: React.FC<ICellRendererParams<Student>> = (props) => {
  const { value, node, colDef } = props;

  const updateAge = (delta: number) => {
    const newValue = Math.max(0, (value || 0) + delta); // prevent negative ages
    // api.applyTransaction({
    //   update: [{ ...node.data as Student, [colDef?.field!]: newValue } as Student]
    // });
    node.setDataValue(colDef?.field!, newValue);
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <IconButton 
        size="small" 
        onClick={() => updateAge(-1)} 
        sx={{
          border: "1px solid #1976d2",   // blue border
          borderRadius: "6px",           // square-ish corners
          padding: "2px",                // smaller padding
          color: "#1976d2"               // icon color
        }}>
        <RemoveIcon fontSize="small" />
      </IconButton>
      <span>{value}</span>
      <IconButton 
        size="small" 
        onClick={() => updateAge(1)}
        sx={{
          border: "1px solid #1976d2",   // blue border
          borderRadius: "6px",           // square-ish corners
          padding: "2px",                // smaller padding
          color: "#1976d2"               // icon color
        }}>
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

// 👉 Custom Boolean Renderer with MUI Switch
const BooleanRenderer: React.FC<ICellRendererParams<Student>> = (props) => {
  const { value, node, colDef } = props;

  const toggle = () => {
    // api.applyTransaction({
    //   update: [{ ...node.data as Student, [colDef?.field!]: !value }]
    // });
    node.setDataValue(colDef?.field!, value);
  };

  return (
    <Switch checked={value} onChange={toggle} size="small" />
  );
};

const MyTable: React.FC = () => {
  // Column definitions
  const [columnDefs] = useState<ColDef<Student>[]>([
    { headerName: "Name", field: "name", sortable: true, filter: true, editable: true },
    {
      headerName: "College",
      field: "college",
      editable: true,
      cellEditor: CollegeAutocompleteEditor
    },
    {
      headerName: "Age",
      field: "age",
      cellRenderer: AgeRenderer
    },
    {
      headerName: "Present",
      field: "isPresent",
      cellRenderer: BooleanRenderer
    }
  ]);

  // Row data
  const rowData: Student[] = [
    { name: "Azhar", college: "IIT", age: 25, isPresent: true },
    { name: "Rahul", college: "NIT", age: 22, isPresent: false },
    { name: "Sara", college: "BITS Pilani", age: 24, isPresent: true }
  ];

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: 2000 }}>
      <AgGridReact<Student>
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{
          flex: 1,
          resizable: true
        }}
        stopEditingWhenCellsLoseFocus={false}
        theme={"legacy"}
      />
    </div>
  );
};

export default MyTable;
