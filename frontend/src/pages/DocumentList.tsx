import React, { useEffect, useState, useCallback } from "react";
import { Box, TablePagination, Typography, Alert, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

import { Document, Tag } from "../types";
import DocumentService from "../services/document.service";
import TagService from "../services/tag.service";
import DocumentSearch from "../components/documents/DocumentSearch";
import DocumentDialog from "../components/documents/DocumentDialog";
import DeleteDialog from "../components/documents/DeleteDialog";
import DocumentTable from "../components/documents/DocumentTable";
import { useNavigate } from "react-router-dom";
import StorageService from "../services/storage.service";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { Dayjs } from "dayjs";
import { dateToISOString } from "../utils/date.utils";
import UploadDocumentDialog from "../components/documents/UploadDocumentDialog";
import { getErrorMessage } from "../utils/error.utils";
import { isValidDate } from "../utils/date.utils";

type FilterType = "text" | "date" | "tags";

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);

      // Only include valid dates in the request
      const validStartDate = isValidDate(startDate)
        ? dateToISOString(startDate)
        : undefined;
      const validEndDate = isValidDate(endDate)
        ? dateToISOString(endDate)
        : undefined;

      const docsResponse = await DocumentService.searchDocuments({
        searchTerm,
        startDate: validStartDate,
        endDate: validEndDate,
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
      setInitialLoading(false);
    }
  }, [searchTerm, startDate, endDate, selectedTags, page, rowsPerPage]);

  // Initial load
  useEffect(() => {
    if (!StorageService.hasValidSession()) {
      navigate("/login");
      return;
    }

    fetchDocuments();
  }, [navigate, fetchDocuments]);

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

  const handleFilterTypeChange = (newType: FilterType) => {
    setFilterType(newType);
  };

  const handleSearchClear = () => {
    setSearchTerm("");
    setStartDate(null);
    setEndDate(null);
    setSelectedTags([]);
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
      fetchDocuments();
    } catch (err) {
      console.error("Delete error:", err);
      setError(getErrorMessage(err, "Failed to delete document"));
      handleCloseDeleteDialog();
    }
  };

  const handleOpenDocument = (document: Document, inEditMode = false) => {
    setSelectedDocument(document);
    setEditMode(inEditMode);
  };

  const handleDocumentUpdate = (updatedDocument: Document) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) =>
        doc.id === updatedDocument.id ? updatedDocument : doc
      )
    );

    if (selectedDocument?.id === updatedDocument.id) {
      setSelectedDocument(updatedDocument);
    }
  };

  if (initialLoading) return <LoadingSpinner />;

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

      <DocumentTable
        documents={documents}
        onDownload={handleDownload}
        onDelete={handleOpenDeleteDialog}
        onOpen={handleOpenDocument}
        isLoading={loading}
      />

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
          fetchDocuments();
        }}
      />

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
