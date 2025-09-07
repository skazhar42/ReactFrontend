import { useState, useImperativeHandle, forwardRef } from "react";
import type { ICellEditorParams } from "ag-grid-community";
import { Autocomplete, TextField, IconButton, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface CollegeAutocompleteEditorProps extends ICellEditorParams {}

const CollegeAutocompleteEditor = forwardRef((props: CollegeAutocompleteEditorProps, ref) => {
  const [value, setValue] = useState<string>(props.value ?? "");
  const [options, setOptions] = useState<string[]>(["IIT", "NIT", "BITS Pilani", "IIIT"]);
  const [inputValue, setInputValue] = useState<string>("");

  // Required by AG Grid to get final value
  useImperativeHandle(ref, () => ({
    getValue: () => value
  }));

  const handleAdd = () => {
    if (inputValue && !options.includes(inputValue)) {
      setOptions((prev) => [...prev, inputValue]);
      setValue(inputValue);
      setInputValue("");
    }
  };

  const handleDelete = (option: string) => {
    setOptions((prev) => prev.filter((o) => o !== option));
    if (value === option) setValue("");
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Autocomplete
        freeSolo
        value={value}
        options={options}
        onChange={(_event, newValue) => {
          if (typeof newValue === "string") setValue(newValue);
        }}
        inputValue={inputValue}
        onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder="Select or Add College"
          />
        )}
        renderOption={(propsOption, option) => (
          <Box
            component="li"
            {...propsOption}
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
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
        )}
        onKeyDown={(e) => e.stopPropagation()} // Prevent AG Grid from stealing keys
      />
      <Box sx={{ display: "flex", marginTop: 0.5 }}>
        <TextField
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          size="small"
          placeholder="Add new college"
          fullWidth
          onKeyDown={(e) => e.stopPropagation()}
        />
        <IconButton color="primary" onClick={handleAdd}>
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
});

export default CollegeAutocompleteEditor;
