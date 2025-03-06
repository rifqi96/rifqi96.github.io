import type { WorkExperience } from "../../../types/WorkExperience";
import { useSupabaseClient } from "../../../composables/useSupabaseClient";

// Work experience services
export const experienceService = {
  // Get all work experiences
  async getAllExperiences() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("work_experiences")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as WorkExperience[];
  },

  // Get a single work experience
  async getExperience(id: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("work_experiences")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as WorkExperience;
  },

  // Create a new work experience
  async createExperience(experience: Partial<WorkExperience>) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("work_experiences")
      .insert([experience])
      .select()
      .single();

    if (error) throw error;
    return data as WorkExperience;
  },

  // Update a work experience
  async updateExperience(id: string, experience: Partial<WorkExperience>) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("work_experiences")
      .update(experience)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkExperience;
  },

  // Delete a work experience
  async deleteExperience(id: string) {
    const supabase = useSupabaseClient();
    const { error } = await supabase
      .from("work_experiences")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },
};
