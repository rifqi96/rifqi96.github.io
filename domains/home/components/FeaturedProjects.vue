<script setup lang="ts">
import { useProject } from "@/domains/home/composables/useProject";
import ProjectCard from "./ProjectCard.vue";

const { projects: featuredProjects, status } = useProject(true);
const isLoading = computed(
  () => status.value === "pending" || status.value === "idle",
);
</script>

<template>
  <section class="projects-section">
    <v-container>
      <div class="section-header">
        <h2 class="section-title">Featured Projects</h2>
        <div class="section-divider"></div>
        <p class="section-description">
          A selection of my recent work and experiments
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4">Loading projects...</p>
      </div>

      <v-row v-else class="mt-8">
        <v-col
          v-for="(project, index) in featuredProjects"
          :key="index"
          cols="12"
          md="6"
          lg="4"
        >
          <ProjectCard :project="project" />
        </v-col>
      </v-row>

      <div class="text-center mt-12">
        <v-btn to="/projects" color="primary" size="large" variant="tonal"
          >View All Projects</v-btn
        >
      </div>
    </v-container>
  </section>
</template>

<style scoped>
/* Section styling */
.section-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 40px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(
    135deg,
    var(--v-primary-base),
    rgb(var(--v-theme-primary))
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-divider {
  width: 80px;
  height: 4px;
  background: linear-gradient(
    to right,
    var(--v-primary-base),
    rgb(var(--v-theme-primary))
  );
  margin: 0 auto 16px;
  border-radius: 4px;
}

.section-description {
  font-size: 1.1rem;
  color: rgb(var(--v-theme-text-muted));
  max-width: 600px;
  margin: 0 auto;
}

/* Animation for section */
.section-animation {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}

.section-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Media Queries */
@media (max-width: 960px) {
  .projects-section {
    padding: 80px 0;
  }

  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 600px) {
  .projects-section {
    padding: 60px 0;
  }
}
</style>
