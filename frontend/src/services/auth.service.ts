import {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  JwtPayload,
  ApiResponse,
} from "../types";
import { get, post } from "./api.service";
import StorageService from "./storage.service";

const AuthService = {
  hello: async (): Promise<string> => {
    try {
      const response = await get<string>("/hello");
      return response.data;
    } catch (error) {
      console.error("Hello service error:", error);
      throw error;
    }
  },

  login: async (credentials: LoginRequest): Promise<JwtPayload> => {
    const response = await post<TokenResponse, LoginRequest>(
      "/auth/login",
      credentials
    );

    if (!response.data.accessToken) {
      throw new Error("No access token received");
    }

    StorageService.setAccessToken(response.data.accessToken);
    if (response.data.refreshToken) {
      StorageService.setRefreshToken(response.data.refreshToken);
    }

    const decodedToken = StorageService.getDecodedToken();
    if (!decodedToken) {
      throw new Error("Invalid token received");
    }

    return decodedToken;
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<string>> => {
    return await post<string, RegisterRequest>("/auth/register", userData);
  },

  refreshToken: async (): Promise<void> => {
    const refreshToken = StorageService.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await post<TokenResponse, { refreshToken: string }>(
        "/auth/refresh",
        { refreshToken }
      );

      if (!response.data.accessToken) {
        throw new Error("No access token received from refresh");
      }

      StorageService.setAccessToken(response.data.accessToken);
      if (response.data.refreshToken) {
        StorageService.setRefreshToken(response.data.refreshToken);
      }
    } catch (error) {
      StorageService.clearAuth();
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    const refreshToken = StorageService.getRefreshToken();

    // Always clear local auth data first to ensure logout works client-side
    // even if the server call fails
    StorageService.clearAuth();

    if (refreshToken) {
      try {
        // Attempt to notify server about logout
        await post("/auth/logout", { refreshToken });
      } catch (error: any) {
        console.error("Error during logout API call:", error);
        console.error("Logout server error details:", {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          error: error.response?.data || error,
        });
        // Don't rethrow - we already cleared local storage
      }
    } else {
      console.log("No refresh token found for server-side logout");
    }
  },

  getCurrentUser: (): JwtPayload | null => {
    return StorageService.getDecodedToken();
  },

  isAuthenticated: (): boolean => {
    return StorageService.hasValidSession();
  },
};

export default AuthService;
