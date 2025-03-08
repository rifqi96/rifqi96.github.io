import type { UserProfile } from "./User";
import type { Media } from "./Media";

export interface ContentBlock {
  id: string;
  type: string;
  content: any;
  attrs?: Record<string, any>;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string; // Legacy content field (for backward compatibility)
  content_blocks: ContentBlock[]; // New structured content
  is_published: boolean;
  image_url?: string; // Renamed from featured_image
  media_id?: string;
  media?: Media;
  tags: string[];
  order: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  author?: UserProfile;
}
