import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AuthContextType,
  AuthState,
  LoginRequest,
  RegisterRequest,
} from "../types";
import AuthService from "../services/auth.service";
import { mapJwtPayloadToUserInfo } from "../utils/auth.utils";

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
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: AuthService.isAuthenticated(),
    user: AuthService.getCurrentUser()
      ? mapJwtPayloadToUserInfo(AuthService.getCurrentUser()!)
      : null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const jwtPayload = AuthService.getCurrentUser();
    if (jwtPayload) {
      setAuthState({
        isAuthenticated: true,
        user: mapJwtPayloadToUserInfo(jwtPayload),
        loading: false,
        error: null,
      });
    }
  }, []);

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
    AuthService.logout();

    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
