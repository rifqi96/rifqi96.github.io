import type { Media } from "./Media";

export interface Project {
  id: string;
  title: string;
  description: string;
  link?: string;
  image_url?: string;
  media_id?: string;
  media?: Media;
  repo_url?: string;
  technologies?: string[];
  start_date?: string;
  end_date?: string;
  is_featured: boolean;
  is_available: boolean;
  is_coming_soon: boolean;
  is_published: boolean;
  order?: number;
  created_at: string;
  updated_at: string;
}
