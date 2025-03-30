import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { ApiOptions, ApiResponse, ErrorResponse } from "../types";
import StorageService from "./storage.service";
import AuthService from "./auth.service";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  //withCredentials: true,
});

export const AUTH_EVENTS = {
  UNAUTHORIZED: "auth:unauthorized",
};

// Queue for requests that are waiting for token refresh
let refreshQueue: Promise<void>[] = [];

apiClient.interceptors.request.use(
  async (config) => {
    const token = StorageService.getAccessToken();
    console.log("Making request with token:", token);

    // Only attempt refresh if there's a token and it's expired
    if (
      token &&
      StorageService.isTokenExpired() &&
      config.url !== "/auth/refresh"
    ) {
      try {
        // If there are no refresh attempts in progress, start a new one
        if (refreshQueue.length === 0) {
          const refreshPromise = AuthService.refreshToken();
          refreshQueue.push(refreshPromise);
          await refreshPromise;
          refreshQueue = [];
        } else {
          // Wait for the ongoing refresh to complete
          await refreshQueue[0];
        }

        const newToken = StorageService.getAccessToken();
        if (newToken && config.headers) {
          config.headers["Authorization"] = `Bearer ${newToken}`;
        }
      } catch (error) {
        StorageService.clearAuth();
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
        return Promise.reject(error);
      }
    }

    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 401) {
      StorageService.clearAuth();
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
    }
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export const get = async <T>(
  url: string,
  options?: ApiOptions
): Promise<ApiResponse<T>> => {
  try {
    const config: AxiosRequestConfig = {
      headers: options?.headers,
      params: options?.params,
      withCredentials: options?.withCredentials,
    };

    const response: AxiosResponse<T> = await apiClient.get(url, config);

    return {
      data: response.data,
      status: response.status,
      message: response.statusText,
    };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(axiosError.response?.data?.message || axiosError.message);
  }
};

export const post = async <T, D>(
  url: string,
  data: D,
  options?: ApiOptions
): Promise<ApiResponse<T>> => {
  try {
    const config: AxiosRequestConfig = {
      headers: options?.headers,
      params: options?.params,
      withCredentials: options?.withCredentials,
    };

    const response: AxiosResponse<T> = await apiClient.post(url, data, config);

    return {
      data: response.data,
      status: response.status,
      message: response.statusText,
    };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(axiosError.response?.data?.message || axiosError.message);
  }
};

export const put = async <T, D>(
  url: string,
  data: D,
  options?: ApiOptions
): Promise<ApiResponse<T>> => {
  try {
    const config: AxiosRequestConfig = {
      headers: options?.headers,
      params: options?.params,
      withCredentials: options?.withCredentials,
    };

    const response: AxiosResponse<T> = await apiClient.put(url, data, config);

    return {
      data: response.data,
      status: response.status,
      message: response.statusText,
    };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(axiosError.response?.data?.message || axiosError.message);
  }
};

export const del = async <T>(
  url: string,
  options?: ApiOptions
): Promise<ApiResponse<T>> => {
  try {
    const config: AxiosRequestConfig = {
      headers: options?.headers,
      params: options?.params,
      withCredentials: options?.withCredentials,
    };

    const response: AxiosResponse<T> = await apiClient.delete(url, config);

    return {
      data: response.data,
      status: response.status,
      message: response.statusText,
    };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(axiosError.response?.data?.message || axiosError.message);
  }
};

export const uploadFile = async <T>(
  url: string,
  file: File,
  data?: Record<string, any>,
  options?: ApiOptions
): Promise<ApiResponse<T>> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    if (data) {
      Object.keys(data).forEach((key) => {
        if (Array.isArray(data[key])) {
          data[key].forEach((value: any) => {
            formData.append(key, value);
          });
        } else {
          formData.append(key, data[key]);
        }
      });
    }

    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
        ...options?.headers,
      },
      params: options?.params,
      withCredentials: options?.withCredentials,
    };

    const response: AxiosResponse<T> = await apiClient.post(
      url,
      formData,
      config
    );

    return {
      data: response.data,
      status: response.status,
      message: response.statusText,
    };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(axiosError.response?.data?.message || axiosError.message);
  }
};

const apiService = {
  get,
  post,
  put,
  del,
  uploadFile,
};

export default apiService;
