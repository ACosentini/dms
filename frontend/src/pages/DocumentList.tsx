import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Typography,
  Alert,
  Button,
  Tooltip,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

import { Document, Tag } from "../types";
import DocumentService from "../services/document.service";
import TagService from "../services/tag.service";
import DocumentSearch from "../components/documents/DocumentSearch";
import DocumentDialog from "../components/documents/DocumentDialog";
import DeleteDialog from "../components/documents/DeleteDialog";
import { useNavigate } from "react-router-dom";
import StorageService from "../services/storage.service";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { Dayjs } from "dayjs";
import { dateToISOString, formatDate } from "../utils/date.utils";
import UploadDocumentDialog from "../components/documents/UploadDocumentDialog";
import { getErrorMessage } from "../utils/error.utils";

// Define filter types
type FilterType = "text" | "date" | "tags";

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Add filter type state
  const [filterType, setFilterType] = useState<FilterType>("text");

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
    null
  );

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagsResponse = await TagService.getAllTags();
        setTags(tagsResponse);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to fetch tags"));
      }
    };
    loadTags();
  }, []);

  useEffect(() => {
    if (!StorageService.hasValidSession()) {
      navigate("/login");
      return;
    }

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const docsResponse = await DocumentService.searchDocuments({
          searchTerm,
          startDate: dateToISOString(startDate),
          endDate: dateToISOString(endDate),
          tagIds: selectedTags.map((tag) => tag.id),
          page,
          size: rowsPerPage,
        });
        setDocuments(docsResponse.content);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to fetch documents"));
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [
    navigate,
    searchTerm,
    startDate,
    endDate,
    selectedTags,
    page,
    rowsPerPage,
  ]);

  const handleFilterTypeChange = (newType: FilterType) => {
    setFilterType(newType);
  };

  const handleSearchClear = () => {
    setSearchTerm("");
    setStartDate(null);
    setEndDate(null);
    setSelectedTags([]);
    // Reset filter type when clearing
    setFilterType("text");
  };

  const handleDownload = async (document: Document) => {
    try {
      setError(null);
      await DocumentService.downloadDocument(document.id);
    } catch (err) {
      console.error("Download error:", err);
      setError(getErrorMessage(err, "Failed to download document"));
    }
  };

  const handleOpenUploadDialog = () => {
    setUploadDialogOpen(true);
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
  };

  const handleOpenDeleteDialog = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      setError(null);
      await DocumentService.deleteDocument(documentToDelete.id);
      handleCloseDeleteDialog();
      refreshDocuments();
    } catch (err) {
      console.error("Delete error:", err);
      setError(getErrorMessage(err, "Failed to delete document"));
      handleCloseDeleteDialog();
    }
  };

  // Method to refresh documents after upload or update
  const refreshDocuments = async () => {
    try {
      setLoading(true);
      const docsResponse = await DocumentService.searchDocuments({
        searchTerm,
        startDate: dateToISOString(startDate),
        endDate: dateToISOString(endDate),
        tagIds: selectedTags.map((tag) => tag.id),
        page,
        size: rowsPerPage,
      });
      setDocuments(docsResponse.content);

      // If we have a selected document, refresh it too
      if (selectedDocument) {
        const refreshedDoc = docsResponse.content.find(
          (doc) => doc.id === selectedDocument.id
        );
        if (refreshedDoc) {
          setSelectedDocument(refreshedDoc);
        }
      }

      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch documents"));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = (document: Document, inEditMode = false) => {
    setSelectedDocument(document);
    setEditMode(inEditMode);
  };

  // Update the handleDocumentUpdate method to update a single document without full refresh
  const handleDocumentUpdate = (updatedDocument: Document) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) =>
        doc.id === updatedDocument.id ? updatedDocument : doc
      )
    );

    // Also update the selected document if it's the same one
    if (selectedDocument?.id === updatedDocument.id) {
      setSelectedDocument(updatedDocument);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5">Documents</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenUploadDialog}
        >
          Add Document
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DocumentSearch
        filterType={filterType}
        onFilterTypeChange={handleFilterTypeChange}
        searchTerm={searchTerm}
        startDate={startDate}
        endDate={endDate}
        selectedTags={selectedTags}
        availableTags={tags}
        onSearchTermChange={setSearchTerm}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onTagsChange={setSelectedTags}
        onClear={handleSearchClear}
      />

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
                        onClick={() => handleOpenDocument(document)}
                        color="primary"
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton onClick={() => handleDownload(document)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleOpenDeleteDialog(document)}
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

      <TablePagination
        component="div"
        count={-1}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />

      <DocumentDialog
        document={selectedDocument}
        tags={tags}
        open={!!selectedDocument}
        onClose={() => {
          setSelectedDocument(null);
          setEditMode(false);
        }}
        onUpdateSuccess={handleDocumentUpdate}
        startInEditMode={editMode}
      />

      <UploadDocumentDialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
        availableTags={tags}
        onSuccess={() => {
          handleCloseUploadDialog();
          refreshDocuments();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteDocument}
        documentName={documentToDelete?.name || ""}
      />
    </>
  );
};

export default DocumentList;
