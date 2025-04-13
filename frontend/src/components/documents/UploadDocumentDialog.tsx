import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  CircularProgress,
  Typography,
  Autocomplete,
  Chip,
} from "@mui/material";
import { Tag, DocumentUploadRequest } from "../../types";
import DocumentService from "../../services/document.service";
import { getErrorMessage } from "../../utils/error.utils";

interface UploadDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  availableTags: Tag[];
  onSuccess: () => void;
}

const UploadDocumentDialog: React.FC<UploadDocumentDialogProps> = ({
  open,
  onClose,
  availableTags,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      // Auto-fill name field with filename if empty
      if (!name) {
        setName(file.name);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    if (!name.trim()) {
      setError("Please enter a document name");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const uploadData: DocumentUploadRequest = {
        file: selectedFile,
        name: name.trim(),
        tagIds: selectedTags.map((tag) => tag.id),
      };

      await DocumentService.uploadDocument(uploadData);

      // Reset form
      setName("");
      setSelectedFile(null);
      setSelectedTags([]);

      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to upload document"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName("");
      setSelectedFile(null);
      setSelectedTags([]);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Document</DialogTitle>
      <DialogContent>
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ mb: 2, mt: 1 }}>
          <TextField
            label="Document Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            disabled={loading}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            disabled={loading}
            sx={{ mb: 1 }}
          >
            Select File
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept="application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
          </Button>
          {selectedFile && (
            <Typography variant="body2">
              Selected: {selectedFile.name} (
              {Math.round(selectedFile.size / 1024)} KB)
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Autocomplete
            multiple
            options={availableTags}
            value={selectedTags}
            onChange={(_, newValue) => setSelectedTags(newValue)}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option.name} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Select tags"
                disabled={loading}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !selectedFile || !name.trim()}
        >
          {loading ? <CircularProgress size={24} /> : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDocumentDialog;
