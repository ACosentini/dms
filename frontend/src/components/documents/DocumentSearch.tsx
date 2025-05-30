import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Autocomplete,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { Tag } from "../../types";
import { Dayjs } from "dayjs";
import TagService from "../../services/tag.service";
import useDebounce from "../../hooks/useDebounce";
import { isValidDate } from "../../utils/date.utils";

type FilterType = "text" | "date" | "tags";

interface DocumentSearchProps {
  filterType: FilterType;
  onFilterTypeChange: (type: FilterType) => void;
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

const DocumentSearch = React.memo(
  ({
    filterType,
    onFilterTypeChange,
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
  }: DocumentSearchProps) => {
    const [open, setOpen] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [localTagSearchTerm, setLocalTagSearchTerm] = useState("");
    const [options, setOptions] = useState<Tag[]>(availableTags);
    const [loading, setLoading] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setLocalSearchTerm(searchTerm);
    }, [searchTerm]);

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

    // Document search debounce with focus preservation
    useDebounce(localSearchTerm, 500, (value: string) => {
      onSearchTermChange(value);

      // Restore focus after state update
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
    });

    // Tag search debounce
    useDebounce(localTagSearchTerm, 500, handleTagSearch);

    // Check if both dates are present for date filter
    const dateFilterError =
      filterType === "date" &&
      (!startDate || (isValidDate(startDate) && !endDate));

    const handleFilterTypeChange = (newType: FilterType) => {
      // Clear other filters based on the new type
      if (newType !== "text" && searchTerm) {
        onSearchTermChange("");
        setLocalSearchTerm("");
      }

      if (newType !== "date" && (startDate || endDate)) {
        onStartDateChange(null);
        onEndDateChange(null);
      }

      if (newType !== "tags" && selectedTags.length > 0) {
        onTagsChange([]);
      }

      onFilterTypeChange(newType);
    };

    // Focus the search input when switching to text filter
    useEffect(() => {
      if (filterType === "text" && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [filterType]);

    const handleStartDateChange = (newStartDate: Dayjs | null) => {
      onStartDateChange(newStartDate);

      if (isValidDate(newStartDate) && isValidDate(endDate)) {
        if (newStartDate && endDate && newStartDate.isAfter(endDate)) {
          // Clear the end date if the start date is after it
          onEndDateChange(null);
        }
      }
    };

    return (
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="start">
          <Grid size={{ xs: 12, sm: 3, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Filter Type</InputLabel>
              <Select
                value={filterType}
                label="Filter Type"
                onChange={(e) => {
                  handleFilterTypeChange(e.target.value as FilterType);
                }}
              >
                <MenuItem value="text">Search by Text</MenuItem>
                <MenuItem value="date">Search by Date Range</MenuItem>
                <MenuItem value="tags">Search by Tags</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 8, md: 9 }}>
            {filterType === "text" && (
              <TextField
                fullWidth
                label="Search documents"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                inputRef={searchInputRef}
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
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            )}

            {filterType === "date" && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        size: "medium",
                        fullWidth: true,
                        error: dateFilterError && !startDate,
                        helperText:
                          dateFilterError && !startDate
                            ? "Start date required"
                            : null,
                        slotProps: {
                          inputLabel: {
                            shrink: true,
                          },
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={onEndDateChange}
                    format="DD/MM/YYYY"
                    minDate={startDate || undefined}
                    disabled={!isValidDate(startDate)}
                    slotProps={{
                      textField: {
                        size: "medium",
                        fullWidth: true,
                        error:
                          dateFilterError && isValidDate(startDate) && !endDate,
                        helperText:
                          dateFilterError && isValidDate(startDate) && !endDate
                            ? "End date required"
                            : null,
                        slotProps: {
                          inputLabel: {
                            shrink: true,
                          },
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            )}

            {filterType === "tags" && (
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
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Select tags"
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      },
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />
                )}
              />
            )}
          </Grid>

          <Grid
            size={{ xs: 12, sm: 1, md: 1 }}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <IconButton onClick={onClear} color="primary">
              <ClearIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
    );
  }
);

DocumentSearch.displayName = "DocumentSearch";

export default DocumentSearch;
