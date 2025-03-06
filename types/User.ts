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
