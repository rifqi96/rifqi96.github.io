import type { UserProfile } from "./User";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  published: boolean;
  image?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  author_id: string;
  author?: UserProfile;
}
