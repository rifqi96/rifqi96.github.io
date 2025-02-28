/**
 * Composable for loading projects data
 */
import type { Ref } from "vue";
import { useCSVParser } from "./useCSVParser";

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  technologies: string[];
  isAvailable: boolean;
}

export function useProject(): {
  projects: Ref<Project[] | null>;
  featuredProjects: Ref<Project[] | null>;
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
    data: projects,
    status,
    error,
    refresh,
  } = useAsyncData("projects", async () => {
    try {
      const csvData = await $fetch(`${baseURL}/data/projects.csv`);
      return parseCSV<Project>(String(csvData));
    } catch (err) {
      console.error("Error fetching projects:", err);
      throw err;
    }
  });

  const featuredProjects = computed(() => {
    return (
      projects.value
        ?.filter((project) => project.isAvailable === true)
        .slice(0, 3) || []
    );
  });

  return {
    projects,
    featuredProjects,
    status,
    error,
    refresh,
  };
}
