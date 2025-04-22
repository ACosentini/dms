import { User, JwtPayload } from "../types";

const APP_PREFIX = "dms_";

export const StorageKeys = {
  ACCESS_TOKEN: `${APP_PREFIX}access_token`,
  REFRESH_TOKEN: `${APP_PREFIX}refresh_token`,
  USER: `${APP_PREFIX}user`,
} as const;

class StorageService {
  private static instance: StorageService;
  private accessToken: string | null = null;
  private decodedToken: JwtPayload | null = null;

  private constructor() {
    // Initialize from localStorage on service creation
    const storedToken = localStorage.getItem(StorageKeys.ACCESS_TOKEN);
    if (storedToken) {
      try {
        this.setAccessToken(storedToken);
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private decodeToken(token: string): JwtPayload {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      throw new Error("Invalid token format");
    }
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    try {
      this.decodedToken = this.decodeToken(token);
      localStorage.setItem(StorageKeys.ACCESS_TOKEN, token);
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setRefreshToken(token: string): void {
    try {
      localStorage.setItem(StorageKeys.REFRESH_TOKEN, token);
    } catch (error) {
      console.error("Error storing refresh token:", error);
    }
  }

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(StorageKeys.REFRESH_TOKEN);
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  }

  getDecodedToken(): JwtPayload | null {
    return this.decodedToken;
  }

  isTokenExpired(): boolean {
    if (!this.decodedToken) return true;

    const now = Date.now();
    const expiryTime = this.decodedToken.exp * 1000;

    // Token is expired if current time is past expiry time
    // Use a small buffer (30 seconds) to refresh slightly before expiration
    return now > expiryTime - 30000;
  }

  clearAuth(): void {
    this.accessToken = null;
    this.decodedToken = null;
    try {
      localStorage.removeItem(StorageKeys.ACCESS_TOKEN);
      localStorage.removeItem(StorageKeys.REFRESH_TOKEN);
      localStorage.removeItem(StorageKeys.USER);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  }

  hasValidSession(): boolean {
    return !!this.accessToken && !this.isTokenExpired();
  }

  getUser(): User | null {
    try {
      const user = localStorage.getItem(StorageKeys.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error accessing user:", error);
      return null;
    }
  }

  setUser(user: User): void {
    try {
      localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
    } catch (error) {
      console.error("Error storing user:", error);
    }
  }
}

export default StorageService.getInstance();
