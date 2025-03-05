export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
}

export enum UserRole {
  SUPERADMIN = "superadmin",
  WHITELISTED_USER = "whitelisted_user",
}

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

export enum OptionAccessLevel {
  SUPERADMIN_ONLY = "superadmin_only",
  WHITELISTED = "whitelisted",
  PUBLIC = "public",
}

export interface AppOption {
  id: string;
  key: string;
  value: string;
  description?: string;
  access_level: OptionAccessLevel;
  created_at: string;
  updated_at: string;
}

export interface WhitelistEntry {
  id: string;
  email: string;
  added_by: string;
  created_at: string;
}
