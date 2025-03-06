import type { Project } from "@/types/Project";

// Project services
export const projectService = {
  // Get all projects
  async getAllProjects() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Project[];
  },
};
