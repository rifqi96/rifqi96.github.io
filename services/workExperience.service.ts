import type { WorkExperience } from "@/types/WorkExperience";

// Work experience services
export const experienceService = {
  // Get all work experiences
  async getAllExperiences() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("work_experiences")
      .select(
        `
        *,
        media!company_logo_media_id(
          id,
          bucket_name,
          storage_path,
          file_name,
          mime_type,
          size_bytes
        )
      `,
      )
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data as WorkExperience[];
  },
};
