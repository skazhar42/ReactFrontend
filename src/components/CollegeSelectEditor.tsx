import { useState, useImperativeHandle, forwardRef } from "react";
import { type ICellEditorParams } from "ag-grid-community";
import {
  Select,
  MenuItem,
  IconButton,
  TextField,
  Box
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const CollegeSelectEditor = forwardRef((props: ICellEditorParams, ref) => {
  const [options, setOptions] = useState<string[]>([
    "IIT",
    "NIT",
    "BITS Pilani",
    "IIIT"
  ]);
  const [value, setValue] = useState<string>(props.value);
  const [newOption, setNewOption] = useState<string>("");

  // 👇 Tell AG Grid how to get the final value
  useImperativeHandle(ref, () => ({
    getValue: () => value
  }));

  const handleDelete = (option: string) => {
    setOptions((prev) => prev.filter((o) => o !== option));
    if (value === option) setValue("");
  };

  const handleAdd = () => {
    if (newOption && !options.includes(newOption)) {
      setOptions((prev) => [...prev, newOption]);
      setValue(newOption);
      setNewOption("");
    }
  };

  return (
    <Select
      value={value}
      onChange={() => {}} // disabled
      autoFocus
      size="small"
      sx={{ width: "100%" }}
      renderValue={(selected) => selected || "Select College"}
      // onBlur={() => {
      //   props.stopEditing?.(); // Tell AG Grid editing is done
      // }}
    >
      <MenuItem>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
          <TextField
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            size="small"
            placeholder="Add College"
            fullWidth
            autoFocus={false} // 👈 prevents cursor flicker
            onKeyDown={(e) => {
              e.stopPropagation(); // 👈 block AG Grid from catching this keystroke
            }}
          />
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleAdd();
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </MenuItem>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <span>{option}</span>
            <IconButton
              size="small"
              edge="end"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(option);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </MenuItem>
      ))}

      
    </Select>
  );
});

export default CollegeSelectEditor;
