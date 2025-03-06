import type { Media } from "./Media";

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  description: string;
  start_date: string;
  end_date?: string | null;
  current: boolean;
  technologies: string[];
  company_url?: string | null;
  company_logo_url?: string | null;
  company_logo_media_id?: string | null;
  media?: Media | null;
  created_at: string;
  updated_at: string;
}
