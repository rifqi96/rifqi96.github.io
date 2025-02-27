/**
 * A composable for loading data from CSV files or API endpoints
 */
import { ref, computed } from "vue";
import axios from "axios";
import { useCSVParser } from "./useCSVParser";

// Interface definitions
export interface WorkExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  technologies: string[];
  isAvailable: boolean;
}

export function useDataLoader() {
  const { parseCSV } = useCSVParser();

  const workExperience = ref<WorkExperience[]>([]);
  const projects = ref<Project[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Gets the first 3 available projects
   */
  const getFeaturedProjects = computed(() => {
    return projects.value
      .filter((project) => project.isAvailable === true)
      .slice(0, 3);
  });

  /**
   * Loads data from CSV files
   */
  const loadData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // Load work experience data
      const workExpResponse = await axios.get("/work-experience.csv");
      workExperience.value = parseCSV<WorkExperience>(workExpResponse.data);

      // Load projects data
      const projectsResponse = await axios.get("/projects.csv");
      projects.value = parseCSV<Project>(projectsResponse.data);
    } catch (err) {
      console.error("Error loading data:", err);
      error.value = "Failed to load data.";
    } finally {
      isLoading.value = false;
    }
  };

  return {
    workExperience,
    projects,
    isLoading,
    error,
    loadData,
    getFeaturedProjects,
  };
}
