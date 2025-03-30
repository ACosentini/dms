export interface User {
  id: number;
  username: string;
}

export interface UserUpdateRequest {
  username?: string;
  password?: string;
  currentPassword?: string;
}

export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
