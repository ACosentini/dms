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
} from "@mui/material";
import { Download as DownloadIcon, Add as AddIcon } from "@mui/icons-material";

import { Document, Tag } from "../types";
import DocumentService from "../services/document.service";
import TagService from "../services/tag.service";
import DocumentSearch from "../components/documents/DocumentSearch";
import DocumentDialog from "../components/documents/DocumentDialog";
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

  // Add handler for filter type changes
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

  // Method to refresh documents after upload
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
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch documents"));
    } finally {
      setLoading(false);
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
                  <IconButton onClick={() => setSelectedDocument(document)}>
                    <DownloadIcon />
                  </IconButton>
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
        onClose={() => setSelectedDocument(null)}
        onDownload={handleDownload}
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
    </>
  );
};

export default DocumentList;
