import type { UserProfile } from "@/domains/auth/types";

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

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  featured: boolean;
  image?: string;
  technologies: string[];
  github_url?: string;
  demo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  description: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  technologies: string[];
  created_at: string;
  updated_at: string;
  company_url?: string;
  company_logo?: string;
}
