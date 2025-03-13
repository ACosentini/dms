export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ErrorResponse {
  timestamp: string;
  message: string;
  details: string;
  errorCode: string;
  errors?: Record<string, string>;
}

export interface ApiState {
  loading: boolean;
  error: string | null;
}

export interface ApiOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  withCredentials?: boolean;
}
