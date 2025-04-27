import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Stack,
  Box,
  TextField,
  IconButton,
  Tooltip,
  Autocomplete,
} from "@mui/material";
import { Document, Tag } from "../../types";
import { Edit as EditIcon } from "@mui/icons-material";
import { formatDate } from "../../utils/date.utils";
import DocumentService from "../../services/document.service";

interface DocumentDialogProps {
  document: Document | null;
  tags: Tag[];
  open: boolean;
  onClose: () => void;
  onUpdateSuccess?: (updatedDocument: Document) => void;
  startInEditMode?: boolean;
}

const DocumentDialog: React.FC<DocumentDialogProps> = ({
  document,
  tags,
  open,
  onClose,
  onUpdateSuccess,
  startInEditMode = false,
}) => {
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [newName, setNewName] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);

  // Reset states when dialog opens with a new document
  useEffect(() => {
    if (document && open) {
      setCurrentDocument(document);
      setError(null);

      // Set selected tags based on document's tagIds
      const docTags = tags.filter((tag) => document.tagIds?.includes(tag.id));
      setSelectedTags(docTags);

      if (startInEditMode) {
        setNewName(document.name);
        setIsEditing(true);
      } else {
        setIsEditing(false);
      }
    }
  }, [document, open, startInEditMode, tags]);

  // Safe getters to prevent null reference errors
  const documentName = currentDocument?.name || "";
  const documentUploadDate = currentDocument?.uploadDate || "";
  const documentContentType = currentDocument?.contentType || "";
  const documentTagIds = currentDocument?.tagIds || [];

  const handleEditClick = useCallback(() => {
    if (currentDocument) {
      setNewName(currentDocument.name);
      setIsEditing(true);
    }
  }, [currentDocument]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setError(null);

    // Reset selected tags to match current document
    if (currentDocument) {
      const docTags = tags.filter((tag) =>
        currentDocument.tagIds?.includes(tag.id)
      );
      setSelectedTags(docTags);
    }
  }, [currentDocument, tags]);

  const handleSaveEdit = useCallback(async () => {
    if (!currentDocument) return;

    if (!newName.trim()) {
      setError("Document name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get tag IDs from selectedTags
      const tagIds = selectedTags.map((tag) => tag.id);

      // Optimistically update UI
      const optimisticUpdate = {
        ...currentDocument,
        name: newName.trim(),
        tagIds,
      };
      setCurrentDocument(optimisticUpdate);

      const updatedDocument = await DocumentService.updateDocument(
        currentDocument.id,
        {
          name: newName.trim(),
          tagIds,
        }
      );

      // Update with actual server response
      setCurrentDocument(updatedDocument);
      setIsEditing(false);

      // Notify parent component with the updated document
      if (onUpdateSuccess) {
        onUpdateSuccess(updatedDocument);
      }
    } catch (err: any) {
      // Revert to original on error
      setCurrentDocument(document);
      setError(err.message || "Failed to update document");
    } finally {
      setLoading(false);
    }
  }, [currentDocument, document, newName, onUpdateSuccess, selectedTags]);

  if (!open || !currentDocument) return null;

  const documentTags = tags.filter((tag) => documentTagIds.includes(tag.id));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {isEditing ? (
          <TextField
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            error={!!error}
            helperText={error}
            autoFocus
            disabled={loading}
          />
        ) : (
          <>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {documentName}
            </Typography>
            <Tooltip title="Edit Document">
              <IconButton onClick={handleEditClick} size="small">
                <EditIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Upload Date
            </Typography>
            <Typography>{formatDate(documentUploadDate)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              File Type
            </Typography>
            <Typography>{documentContentType}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Tags
            </Typography>
            {isEditing ? (
              <Autocomplete
                multiple
                options={tags}
                value={selectedTags}
                onChange={(_, newValue) => setSelectedTags(newValue)}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Select tags"
                    fullWidth
                  />
                )}
                disabled={loading}
              />
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {documentTags.map((tag) => (
                  <Chip key={tag.id} label={tag.name} size="small" />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        {isEditing ? (
          <>
            <Button onClick={handleCancelEdit} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              disabled={loading}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} variant="outlined">
              Close
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

// Use React.memo to prevent unnecessary rerenders
export default React.memo(DocumentDialog);
