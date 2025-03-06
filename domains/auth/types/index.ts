import type { UserProfile } from "@/types/User";

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthOptions {
  rememberMe: boolean;
}
