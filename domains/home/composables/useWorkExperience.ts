/**
 * Composable for loading work experience data
 */
import type { Ref } from "vue";
import { useSupabaseClient } from "@/composables/useSupabaseClient";
import type { WorkExperience } from "@/types/WorkExperience";

export function useWorkExperience(): {
  workExperience: Ref<WorkExperience[] | null>;
  status: Ref<"idle" | "pending" | "success" | "error">;
  error: Ref<Error | null>;
  refresh: () => Promise<void>;
} {
  const supabase = useSupabaseClient();

  const {
    data: workExperience,
    status,
    error,
    refresh,
  } = useAsyncData<WorkExperience[]>("work-experience", async () => {
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

    return data;
  });

  return {
    workExperience,
    status,
    error,
    refresh,
  };
}
