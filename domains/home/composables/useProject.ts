/**
 * Composable for loading projects data
 */
import type { Ref } from "vue";
import type { Project } from "@/types/Project";
import { projectService } from "@/services/project.service";

export function useProject(is_featured: boolean = false): {
  projects: Ref<Project[] | null>;
  status: Ref<"idle" | "pending" | "success" | "error">;
  error: Ref<Error | null>;
  refresh: () => Promise<void>;
} {
  const {
    data: projects,
    status,
    error,
    refresh,
  } = useAsyncData("projects", async () => {
    try {
      const data = !is_featured
        ? await projectService.getAllProjects()
        : await projectService.getAllFeaturedProjects();
      return data.map((project) => ({
        ...project,
      }));
    } catch (err) {
      console.error("Error fetching projects:", err);
      throw err;
    }
  });

  return {
    projects,
    status,
    error,
    refresh,
  };
}
