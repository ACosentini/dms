import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Tag } from "../types/tag.types";
import TagService from "../services/tag.service";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { getErrorMessage } from "../utils/error.utils";

const TagManagement: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState("");

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const tags = await TagService.getAllTags();
      setTags(tags);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load tags"));
      console.error("Error loading tags:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleOpenDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setTagName(tag.name);
    } else {
      setEditingTag(null);
      setTagName("");
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTag(null);
    setTagName("");
  };

  const handleSubmit = async () => {
    try {
      if (editingTag) {
        await TagService.updateTag(editingTag.id, { name: tagName });
      } else {
        await TagService.createTag({ name: tagName });
      }
      handleCloseDialog();
      loadTags();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          `Failed to ${editingTag ? "update" : "create"} tag`
        )
      );
      console.error("Error saving tag:", err);
    }
  };

  const handleDelete = async (tagId: number) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      try {
        await TagService.deleteTag(tagId);
        loadTags();
      } catch (err) {
        setError(getErrorMessage(err, "Failed to delete tag"));
        console.error("Error deleting tag:", err);
      }
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5">Tag Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Tag
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>{tag.name}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpenDialog(tag)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(tag.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editingTag ? "Edit Tag" : "Create New Tag"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tag Name"
            fullWidth
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!tagName.trim() || isLoading}
          >
            {editingTag ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TagManagement;
