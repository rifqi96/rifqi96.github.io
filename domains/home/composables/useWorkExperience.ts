/**
 * Composable for loading work experience data
 */
import type { Ref } from "vue";
import { useCSVParser } from "./useCSVParser";

export interface WorkExperience {
  company: string;
  location: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
}

export function useWorkExperience(): {
  workExperience: Ref<WorkExperience[] | null>;
  status: Ref<"idle" | "pending" | "success" | "error">;
  error: Ref<Error | null>;
  refresh: () => Promise<void>;
} {
  const { parseCSV } = useCSVParser();
  const config = useRuntimeConfig();

  const {
    data: workExperience,
    status,
    error,
    refresh,
  } = useAsyncData<WorkExperience[]>("work-experience", async () => {
    try {
      const csvData = await $fetch(
        `${config.public.baseURL}/data/work-experience.csv`,
      );
      return parseCSV<WorkExperience>(String(csvData));
    } catch (err) {
      console.error("Error fetching work experience:", err);
      throw err;
    }
  });

  return {
    workExperience,
    status,
    error,
    refresh,
  };
}
