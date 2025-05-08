import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { Document } from "../../types";
import { formatDate } from "../../utils/date.utils";

interface DocumentTableProps {
  documents: Document[];
  onDownload: (document: Document) => void;
  onDelete: (document: Document) => void;
  onOpen: (document: Document) => void;
  isLoading?: boolean;
}

const DocumentTable = ({
  documents,
  onDownload,
  onDelete,
  onOpen,
  isLoading = false,
}: DocumentTableProps) => {
  return (
    <Fade in={!isLoading} timeout={300}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell>{document.name}</TableCell>
                <TableCell>{formatDate(document.uploadDate)}</TableCell>
                <TableCell>{document.contentType}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex" }}>
                    <Tooltip title="Details">
                      <IconButton
                        onClick={() => onOpen(document)}
                        color="primary"
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton onClick={() => onDownload(document)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => onDelete(document)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Fade>
  );
};

export default React.memo(DocumentTable);
