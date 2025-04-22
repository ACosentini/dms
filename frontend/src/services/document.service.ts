import {
  Document,
  DocumentSearchParams,
  DocumentUpdateRequest,
  DocumentUploadRequest,
  PaginatedResponse,
} from "../types";
import { del, get, post, put, uploadFile, downloadFile } from "./api.service";

const DocumentService = {
  getAllDocuments: async (
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<Document>> => {
    const response = await get<PaginatedResponse<Document>>("/documents", {
      params: { page, size },
    });
    return response.data;
  },

  getDocumentById: async (id: number): Promise<Document> => {
    const response = await get<Document>(`/documents/${id}`);
    return response.data;
  },

  uploadDocument: async (
    documentData: DocumentUploadRequest
  ): Promise<Document> => {
    const { file, name, tagIds } = documentData;
    const response = await uploadFile<Document>("/documents", file, {
      name,
      tagIds: tagIds || [],
    });
    return response.data;
  },

  updateDocument: async (
    id: number,
    documentData: DocumentUpdateRequest
  ): Promise<Document> => {
    const response = await put<Document, DocumentUpdateRequest>(
      `/documents/${id}`,
      documentData
    );
    return response.data;
  },

  deleteDocument: async (id: number): Promise<void> => {
    await del(`/documents/${id}`);
  },

  downloadDocument: async (id: number): Promise<void> => {
    return downloadFile(`/documents/download/${id}`, `document_${id}`);
  },

  searchDocuments: async (
    params: DocumentSearchParams
  ): Promise<PaginatedResponse<Document>> => {
    // Filter out undefined values
    const filteredParams: Partial<DocumentSearchParams> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredParams[key as keyof DocumentSearchParams] = value;
      }
    });

    const response = await post<
      PaginatedResponse<Document>,
      Partial<DocumentSearchParams>
    >("/documents/search", filteredParams);
    return response.data;
  },

  getDocumentsByTag: async (
    tagId: number,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<Document>> => {
    const response = await get<PaginatedResponse<Document>>(
      `/documents/tag/${tagId}`,
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  addTagToDocument: async (
    documentId: number,
    tagId: number
  ): Promise<Document> => {
    const response = await post<Document, null>(
      `/documents/${documentId}/tags/${tagId}`,
      null
    );
    return response.data;
  },

  removeTagFromDocument: async (
    documentId: number,
    tagId: number
  ): Promise<Document> => {
    const response = await del<Document>(
      `/documents/${documentId}/tags/${tagId}`
    );
    return response.data;
  },
};

export default DocumentService;
