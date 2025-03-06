import type { Media } from "@/types/Media";
import type { Project } from "@/types/Project";

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

  // Get a single project
  async getProject(id: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*, media(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Project & { media: Media | null };
  },

  // Create a new project
  async createProject(
    project: Omit<Project, "id" | "created_at" | "updated_at" | "media">,
  ) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  // Update a project
  async updateProject(
    id: string,
    project: Partial<
      Omit<Project, "id" | "created_at" | "updated_at" | "media">
    >,
  ) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .update(project)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  // Delete a project
  async deleteProject(id: string) {
    const supabase = useSupabaseClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
  },

  // Import projects from CSV
  async importFromCSV(
    projects: Omit<Project, "id" | "created_at" | "updated_at" | "media">[],
  ) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .insert(projects)
      .select();

    if (error) throw error;
    return data as Project[];
  },
};
