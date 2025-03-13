import { Tag } from "./tag.types";
import { User } from "./user.types";

export interface Document {
  id: number;
  name: string;
  contentType: string;
  uploadDate: string;
  size?: number;
  tagIds: number[];
  tags?: Tag[];
  owner?: User;
}

export interface DocumentResponse {
  id: number;
  name: string;
  contentType: string;
  uploadDate: string;
  tagIds: number[];
}

export interface DocumentUploadRequest {
  file: File;
  name: string;
  tagIds?: number[];
}

export interface DocumentUpdateRequest {
  name?: string;
  tagIds?: number[];
}

export interface DocumentSearchParams {
  keyword?: string;
  tagId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface DocumentListState {
  documents: Document[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

export interface DocumentDetailState {
  document: Document | null;
  loading: boolean;
  error: string | null;
}

export interface DocumentUploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}
