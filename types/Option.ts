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
