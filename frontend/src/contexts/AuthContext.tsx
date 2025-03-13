import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AuthContextType,
  AuthState,
  LoginRequest,
  RegisterRequest,
  UserInfo,
} from "../types";
import AuthService from "../services/auth.service";

const AuthContext = createContext<AuthContextType>({
  authState: {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  },
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: AuthService.isAuthenticated(),
    user: AuthService.getCurrentUser(),
    loading: false,
    error: null,
  });

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await AuthService.login(credentials);

      const user: UserInfo = {
        id: response.id,
        username: response.username,
        email: response.email,
      };

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
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to register",
      }));
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
