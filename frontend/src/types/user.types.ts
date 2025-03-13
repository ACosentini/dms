export interface User {
  id: number;
  username: string;
  email: string;
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
}

export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
