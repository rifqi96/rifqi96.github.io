<script setup lang="ts">
import { onMounted } from "vue";

// Update page title when the component is mounted
onMounted(() => {
  document.title = "Projects | Rifqi Ruhyattamam";
});

// Project data
const projects = [
  {
    id: "margin-calculator",
    title: "Margin Calculator",
    description:
      "A tool for cryptocurrency traders to calculate margin, stop-loss, and take-profit levels for their trades.",
    technologies: ["Vue.js", "TypeScript", "Vuetify", "Binance API"],
    image: "https://cdn.vuetifyjs.com/images/cards/docks.jpg",
    path: "/margin-calculator",
  },
  // More projects can be added here
];
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
            <v-btn :to="project.path" color="primary" variant="tonal">
              View Project
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.h-100 {
  height: 100%;
}
</style>
