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

  // Get a single project
  async getProject(id: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Project;
  },

  // Create a new project
  async createProject(project: Partial<Project>) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("portfolio_items")
      .insert([project])
      .select();

    if (error) throw error;
    return data[0] as Project;
  },

  // Update a project
  async updateProject(id: string, project: Partial<Project>) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("portfolio_items")
      .update(project)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0] as Project;
  },

  // Delete a project
  async deleteProject(id: string) {
    const supabase = useSupabaseClient();
    const { error } = await supabase
      .from("portfolio_items")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },
};
