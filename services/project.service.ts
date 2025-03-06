import type { Project } from "@/types/Project";
import type { Media } from "@/types/Media";

// Project services
export const projectService = {
  // Get all projects
  async getAllProjects() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*, media(*)")
      .order("order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as (Project & { media: Media | null })[];
  },

  // Get all featured projects
  async getAllFeaturedProjects() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*, media(*)")
      .eq("is_featured", true)
      .order("order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as (Project & { media: Media | null })[];
  },
};
