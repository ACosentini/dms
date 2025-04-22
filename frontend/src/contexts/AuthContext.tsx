import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  AuthContextType,
  AuthState,
  LoginRequest,
  RegisterRequest,
} from "../types";
import AuthService from "../services/auth.service";
import { mapJwtPayloadToUserInfo } from "../utils/auth.utils";
import StorageService from "../services/storage.service";

const AuthContext = createContext<AuthContextType>({
  authState: {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  },
  login: async () => {},
  register: async () => ({ success: false }),
  logout: () => {},
  refreshToken: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: StorageService.hasValidSession(),
    user: StorageService.getDecodedToken()
      ? mapJwtPayloadToUserInfo(StorageService.getDecodedToken()!)
      : null,
    loading: false,
    error: null,
  });

  // Flag to prevent multiple simultaneous refresh attempts
  const isRefreshing = useRef(false);
  // Timeout ref to clear any pending token checks
  const tokenCheckTimeout = useRef<number | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const jwtPayload = StorageService.getDecodedToken();

      if (!jwtPayload) {
        return;
      }

      setAuthState({
        isAuthenticated: true,
        user: mapJwtPayloadToUserInfo(jwtPayload),
        loading: false,
        error: null,
      });

      // Check if token needs to be refreshed
      if (StorageService.isTokenExpired()) {
        await refreshTokenIfNeeded();
      } else {
        // Schedule a token check for just before expiration
        scheduleTokenCheck();
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      if (tokenCheckTimeout.current) {
        window.clearTimeout(tokenCheckTimeout.current);
      }
    };
  }, []);

  // Schedule a check just before the token expires
  const scheduleTokenCheck = () => {
    if (tokenCheckTimeout.current) {
      window.clearTimeout(tokenCheckTimeout.current);
    }

    const jwtPayload = StorageService.getDecodedToken();
    if (!jwtPayload) return;

    // Get time until expiration (subtract 30 seconds for safety margin)
    const timeUntilExpiry = jwtPayload.exp * 1000 - Date.now() - 30000;

    if (timeUntilExpiry <= 0) {
      // Token already expired or about to expire
      refreshTokenIfNeeded();
      return;
    }

    // Schedule refresh just before expiration
    tokenCheckTimeout.current = window.setTimeout(() => {
      refreshTokenIfNeeded();
    }, timeUntilExpiry);
  };

  // Refresh token if needed
  const refreshTokenIfNeeded = async () => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing.current) return;

    const refreshToken = StorageService.getRefreshToken();
    if (!refreshToken) {
      logout();
      return;
    }

    try {
      isRefreshing.current = true;
      await AuthService.refreshToken();

      const jwtPayload = StorageService.getDecodedToken();
      if (jwtPayload) {
        setAuthState({
          isAuthenticated: true,
          user: mapJwtPayloadToUserInfo(jwtPayload),
          loading: false,
          error: null,
        });

        // Schedule next token check
        scheduleTokenCheck();
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
      // If refresh fails, log out
      logout();
    } finally {
      isRefreshing.current = false;
    }
  };

  const login = async (credentials: LoginRequest) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const jwtPayload = await AuthService.login(credentials);
      const user = mapJwtPayloadToUserInfo(jwtPayload);

      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message || "Failed to login",
      });
    }
  };

  const register = async (userData: RegisterRequest) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await AuthService.register(userData);

      setAuthState((prev) => ({
        ...prev,
        loading: false,
      }));

      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to register";

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      throw error;
    }
  };

  const logout = () => {
    if (tokenCheckTimeout.current) {
      window.clearTimeout(tokenCheckTimeout.current);
      tokenCheckTimeout.current = null;
    }

    AuthService.logout();

    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
        refreshToken: refreshTokenIfNeeded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
