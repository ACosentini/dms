import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Stack,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { Tag } from "../../types";
import { Dayjs } from "dayjs";
import TagService from "../../services/tag.service";
import useDebounce from "../../hooks/useDebounce";

interface DocumentSearchProps {
  searchTerm: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  selectedTags: Tag[];
  availableTags: Tag[];
  onSearchTermChange: (value: string) => void;
  onStartDateChange: (date: Dayjs | null) => void;
  onEndDateChange: (date: Dayjs | null) => void;
  onTagsChange: (tags: Tag[]) => void;
  onClear: () => void;
}

const DocumentSearch: React.FC<DocumentSearchProps> = ({
  searchTerm,
  startDate,
  endDate,
  selectedTags,
  availableTags,
  onSearchTermChange,
  onStartDateChange,
  onEndDateChange,
  onTagsChange,
  onClear,
}) => {
  const [open, setOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localTagSearchTerm, setLocalTagSearchTerm] = useState("");
  const [options, setOptions] = useState<Tag[]>(availableTags);
  const [loading, setLoading] = useState(false);

  // Store availableTags in ref to avoid recreation of handleTagSearch
  const availableTagsRef = useRef(availableTags);
  useEffect(() => {
    availableTagsRef.current = availableTags;
  }, [availableTags]);

  // Memoized tag search handler
  const handleTagSearch = useCallback(async (value: string) => {
    if (!value) {
      setOptions(availableTagsRef.current);
      return;
    }

    setLoading(true);
    try {
      const results = await TagService.searchTags(value);
      setOptions(results);
    } catch (error) {
      console.error("Error searching tags:", error);
      setOptions(availableTagsRef.current);
    } finally {
      setLoading(false);
    }
  }, []);

  // Document search debounce
  useDebounce(localSearchTerm, 500, onSearchTermChange);

  // Tag search debounce
  useDebounce(localTagSearchTerm, 500, handleTagSearch);

  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        spacing={2}
        direction={{ xs: "column", md: "row" }}
        alignItems="center"
      >
        <TextField
          fullWidth
          label="Search documents"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  {localSearchTerm && (
                    <IconButton onClick={() => setLocalSearchTerm("")}>
                      <ClearIcon />
                    </IconButton>
                  )}
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={onStartDateChange}
          slotProps={{ textField: { size: "medium" } }}
          sx={{ minWidth: 200 }}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={onEndDateChange}
          slotProps={{ textField: { size: "medium" } }}
          sx={{ minWidth: 200 }}
        />
        <Autocomplete
          multiple
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => {
            setOpen(false);
            setLocalTagSearchTerm("");
            setOptions(availableTags);
          }}
          options={options}
          value={selectedTags}
          loading={loading}
          inputValue={localTagSearchTerm}
          onInputChange={(_, newValue, reason) => {
            if (reason === "input") {
              setLocalTagSearchTerm(newValue);
            }
          }}
          onChange={(_, newValue) => onTagsChange(newValue)}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          filterOptions={(x) => x}
          sx={{ minWidth: 200 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tags"
              placeholder="Select tags"
              slotProps={{
                input: {
                  endAdornment: (
                    <>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
        />
        <IconButton onClick={onClear} color="primary">
          <ClearIcon />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default DocumentSearch;
