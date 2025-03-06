/**
 * Composable for loading work experience data
 */
import type { Ref } from "vue";
import type { WorkExperience } from "@/types/WorkExperience";
import { experienceService } from "@/services/workExperience.service";

export function useWorkExperience(): {
  workExperience: Ref<WorkExperience[] | null>;
  status: Ref<"idle" | "pending" | "success" | "error">;
  error: Ref<Error | null>;
  refresh: () => Promise<void>;
} {
  const {
    data: workExperience,
    status,
    error,
    refresh,
  } = useAsyncData<WorkExperience[]>("work-experience", async () => {
    try {
      const data = await experienceService.getAllExperiences();
      return data.map((experience) => ({
        ...experience,
      }));
    } catch (error) {
      console.error("Error fetching work experience", error);
      throw error;
    }
  });

  return {
    workExperience,
    status,
    error,
    refresh,
  };
}
