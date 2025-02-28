<script setup lang="ts">
import axios from "axios";
import ProjectsList from "@/domains/home/components/ProjectsList.vue";

definePageMeta({
  layout: "default",
});

// SEO metadata
useHead({
  title: "Projects | Rifqi Ruhyattamam",
  meta: [
    {
      name: "description",
      content:
        "Software engineering projects by Rifqi Ruhyattamam, showcasing web development and application design skills.",
    },
  ],
});
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
      <v-col cols="12">
        <ProjectsList />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.loading-projects {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 1.5rem;
}
</style>
