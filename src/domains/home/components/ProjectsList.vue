<script setup lang="ts">
import { onMounted } from "vue";
import { useDataLoader } from "@/domains/home/composables/useDataLoader";

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
          <v-card class="h-100">
            <v-img :src="project.image" height="200" cover></v-img>
            <v-card-title>{{ project.title }}</v-card-title>
            <v-card-text>
              <p>{{ project.description }}</p>
              <v-chip-group class="mt-3">
                <v-chip
                  v-for="tech in project.technologies"
                  :key="tech"
                  size="small"
                  color="primary"
                  variant="outlined"
                >
                  {{ tech }}
                </v-chip>
              </v-chip-group>
            </v-card-text>
            <v-card-actions>
              <v-btn
                v-if="project.link"
                :to="project.link"
                color="primary"
                variant="tonal"
              >
                View Project
              </v-btn>
              <v-btn v-else disabled color="primary" variant="tonal">
                Coming Soon
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.h-100 {
  height: 100%;
}

.projects-list {
  padding: 30px 0;
}
</style>
@/domains/home/composables/useDataLoader
