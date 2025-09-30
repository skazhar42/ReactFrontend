import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import {
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  Paper,
  Stack
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Define row type
interface Validator {
  type: string;
  value?: string;
}

interface Student {
  name: string;
  college: string;
  age: number;
  isPresent: boolean;
  validators: Validator[];
}

ModuleRegistry.registerModules([AllCommunityModule]);

// 👉 Custom Validators Renderer
const ValidatorsRenderer: React.FC<ICellRendererParams<Student>> = (props) => {
  const { value, node, colDef } = props;
  const [open, setOpen] = useState(false);
  const [validators, setValidators] = useState<Validator[]>(value || []);

  // Editor state
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draftType, setDraftType] = useState<string>("regex");
  const [draftValue, setDraftValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const resetEditor = () => {
    setEditingIdx(null);
    setDraftType("regex");
    setDraftValue("");
    setError("");
  };

  const handleAddOrUpdate = () => {
    // check duplicates (ignore when updating same idx)
    const exists = validators.some(
      (v, idx) => v.type === draftType && idx !== editingIdx
    );
    if (exists) {
      setError(`Validator "${draftType}" already exists`);
      return;
    }

    const newValidator: Validator = { type: draftType };
    if (draftType !== "base64") newValidator.value = draftValue;

    let updated: Validator[];
    if (editingIdx !== null) {
      updated = [...validators];
      updated[editingIdx] = newValidator;
    } else {
      updated = [...validators, newValidator];
    }
    setValidators(updated);

    // Update grid
    node.setDataValue(colDef?.field!, updated);

    resetEditor();
  };

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setDraftType(validators[idx].type);
    setDraftValue(validators[idx].value || "");
    setError("");
  };

  const handleRemove = (idx: number) => {
    const updated = validators.filter((_, i) => i !== idx);
    setValidators(updated);
    node.setDataValue(colDef?.field!, updated);
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between" height={30}>
        <Typography variant="body2" noWrap>
          {(validators || []).map((v) => v.type).join(", ")}
        </Typography>
        <IconButton
          size="small"
          onClick={() => setOpen(true)}
          sx={{
            // border: "1px solid #42a5f5",
            // borderRadius: "6px",
            // padding: "2px",
            color: "#42a5f5"
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* 👉 Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Manage Validators</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {/* Editor Box */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box display="flex" gap={2} alignItems="center">
                <Select
                  size="small"
                  value={draftType}
                  onChange={(e) => setDraftType(e.target.value)}
                >
                  <MenuItem value="enum">Enum</MenuItem>
                  <MenuItem value="regex">Regex</MenuItem>
                  <MenuItem value="base64">Base64</MenuItem>
                </Select>

                {draftType === "enum" && (
                  <TextField
                    size="small"
                    label="Enum Values (comma separated)"
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                  />
                )}
                {draftType === "regex" && (
                  <TextField
                    size="small"
                    label="Regex Pattern"
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                  />
                )}
              </Box>

              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}

              <Box mt={2} display="flex" gap={2}>
                <Button
                  variant="contained"
                  onClick={handleAddOrUpdate}
                  disabled={draftType !== "base64" && !draftValue}
                >
                  {editingIdx !== null ? "Update" : "Add"}
                </Button>
                <Button variant="outlined" onClick={resetEditor}>
                  Cancel
                </Button>
              </Box>
            </Paper>

            {/* List of Validators */}
            {validators.map((v, idx) => (
              <Paper
                key={idx}
                variant="outlined"
                sx={{ p: 2, display: "flex", justifyContent: "space-between" }}
              >
                <Box>
                  <Typography variant="subtitle2">{v.type}</Typography>
                  {v.value && (
                    <Typography variant="body2" color="text.secondary">
                      {v.value}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(idx)}
                    sx={{
                      border: "1px solid #42a5f5",
                      borderRadius: "6px",
                      padding: "2px",
                      color: "#42a5f5",
                      mr: 1
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleRemove(idx)}
                    sx={{
                      border: "1px solid #ef5350",
                      borderRadius: "6px",
                      padding: "2px",
                      color: "#ef5350"
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant="contained">
            Return to Table
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const MyTable: React.FC = () => {
  const [columnDefs] = useState<ColDef<Student>[]>([
    { headerName: "Name", field: "name", sortable: true, filter: true, editable: true },
    { headerName: "College", field: "college", editable: true },
    { headerName: "Age", field: "age" },
    { headerName: "Present", field: "isPresent" },
    {
      headerName: "Validators",
      field: "validators",
      cellRenderer: ValidatorsRenderer,
    //   cellStyle: {
    //         display: "flex",
    //         justifyContent: "center",
    //         alignItems: "center"
    //     },
        // flex:2,
    }
  ]);

  const rowData: Student[] = [
    { name: "Azhar", college: "IIT", age: 25, isPresent: true, validators: [{ type: "regex", value: "[a-z]+" }] },
    { name: "Rahul", college: "NIT", age: 22, isPresent: false, validators: [{ type: "enum", value: "A,B,C" }] },
    { name: "Sara", college: "BITS Pilani", age: 24, isPresent: true, validators: [] }
  ];

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: 1000 }}>
      <AgGridReact<Student>
        rowData={rowData}
        columnDefs={columnDefs}
        rowHeight={30}
        defaultColDef={{
          flex: 1,
          resizable: true
        }}
        stopEditingWhenCellsLoseFocus={false}
        theme="legacy"
      />
    </div>
  );
};

export default MyTable;
