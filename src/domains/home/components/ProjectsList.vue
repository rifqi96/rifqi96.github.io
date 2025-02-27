<script setup lang="ts">
import { onMounted } from "vue";
import { useDataLoader } from "@/domains/home/composables/useDataLoader";
import ProjectCard from "./ProjectCard.vue";

const { projects, loadData, isLoading } = useDataLoader();

// Load projects data on component mount
onMounted(async () => {
  await loadData();
});
</script>

<template>
  <div class="projects-list">
    <v-container>
      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4">Loading projects...</p>
      </div>

      <v-row v-else>
        <v-col
          v-for="project in projects"
          :key="project.title"
          cols="12"
          md="6"
          lg="4"
          class="mb-4"
        >
          <ProjectCard :project="project" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.projects-list {
  padding: 30px 0;
}
</style>
