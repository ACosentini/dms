import { JwtResponse, LoginRequest, RegisterRequest } from "../types";
import { get, post } from "./api.service";

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

  login: async (credentials: LoginRequest): Promise<JwtResponse> => {
    const response = await post<JwtResponse, LoginRequest>(
      "/auth/login",
      credentials
    );

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
        })
      );
    }

    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<any> => {
    const response = await post<any, RegisterRequest>(
      "/auth/register",
      userData
    );
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: (): any => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
};

export default AuthService;
