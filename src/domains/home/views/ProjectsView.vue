<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import ProjectCard from "../components/ProjectCard.vue";

const router = useRouter();

// Update page title when the component is mounted
onMounted(async () => {
  document.title = "Projects | Rifqi Ruhyattamam";
  await loadCSVData();
});

// Project interface
interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image: string;
  link: string;
  isAvailable: boolean;
}

// Projects data
const projects = ref<Project[]>([]);

// Function to parse CSV data
const parseCSV = <T,>(text: string): T[] => {
  const lines = text.split("\n");
  const headers = lines[0].split(",").map((header) => header.replace(/"/g, ""));

  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      // Handle commas within quotes correctly
      const values: string[] = [];
      let inQuotes = false;
      let currentValue = "";

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(currentValue.replace(/"/g, ""));
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.replace(/"/g, ""));

      // Create object from headers and values
      const entry = {} as any;
      headers.forEach((header, index) => {
        if (header === "technologies") {
          entry[header] = values[index] ? values[index].split(",") : [];
        } else {
          // Try to convert string to number if possible
          const value = values[index] || "";
          const numberValue = Number(value);
          entry[header] =
            !isNaN(numberValue) && value !== "" ? numberValue : value;
        }
      });

      return entry as T;
    });
};

// Load data from CSV file
const loadCSVData = async () => {
  try {
    const projectsResponse = await axios.get("/data/projects.csv");
    projects.value = parseCSV<Project>(projectsResponse.data);

    if (projects.value.length === 0) {
      console.warn("No projects data found.");
    }
  } catch (error) {
    console.error("Error loading projects data:", error);
  }
};
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-6">Projects</h1>
        <p class="text-subtitle-1 mb-8">
          Here are some of my recent projects. Click on any card to explore
          more.
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="project in projects"
        :key="project.id"
        cols="12"
        md="6"
        lg="4"
        class="mb-4"
      >
        <ProjectCard :project="project" />
      </v-col>
    </v-row>
  </v-container>
</template>
