import React from "react";
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
} from "@mui/material";
import { Document, Tag } from "../../types";
import { Download as DownloadIcon } from "@mui/icons-material";
import { formatDate } from "../../utils/date.utils";

interface DocumentDialogProps {
  document: Document | null;
  tags: Tag[];
  open: boolean;
  onClose: () => void;
  onDownload: (document: Document) => void;
}

const DocumentDialog: React.FC<DocumentDialogProps> = ({
  document,
  tags,
  open,
  onClose,
  onDownload,
}) => {
  if (!document) return null;

  const documentTags = tags.filter((tag) => document.tagIds.includes(tag.id));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{document.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Upload Date
            </Typography>
            <Typography>{formatDate(document.uploadDate)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              File Type
            </Typography>
            <Typography>{document.contentType}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Tags
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {documentTags.map((tag) => (
                <Chip key={tag.id} label={tag.name} size="small" />
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          startIcon={<DownloadIcon />}
          onClick={() => onDownload(document)}
          variant="contained"
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDialog;
