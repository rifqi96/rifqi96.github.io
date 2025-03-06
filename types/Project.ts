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
