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
  const baseURL = import.meta.server
    ? config.public.baseURL
    : window.location.origin;

  const {
    data: workExperience,
    status,
    error,
    refresh,
  } = useAsyncData<WorkExperience[]>("work-experience", async () => {
    const csvData = await $fetch<string>(`${baseURL}/data/work-experience.csv`);
    return parseCSV<WorkExperience>(csvData);
  });

  return {
    workExperience,
    status,
    error,
    refresh,
  };
}
