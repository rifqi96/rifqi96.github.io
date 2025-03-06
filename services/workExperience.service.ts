import type { WorkExperience } from "@/types/WorkExperience";

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
};
