<script setup lang="ts">
import { onMounted } from "vue";

// Update page title when the component is mounted
onMounted(() => {
  document.title = "Rifqi Ruhyattamam | Software Engineer";
});
</script>

<template>
  <v-container fluid>
    <!-- Hero Section -->
    <v-row class="my-12 text-center">
      <v-col cols="12">
        <h1 class="text-h2 font-weight-bold mb-4">Rifqi Ruhyattamam</h1>
        <h2 class="text-h4 mb-6">Software Engineer</h2>
        <p class="text-subtitle-1 mb-8">
          Building innovative solutions with modern technologies
        </p>
      </v-col>
    </v-row>

    <!-- Projects Section -->
    <v-row class="my-12">
      <v-col cols="12">
        <h2 class="text-h4 text-center mb-8">My Projects</h2>
      </v-col>

      <v-col cols="12" md="6" lg="4">
        <v-card elevation="2" class="h-100">
          <v-img
            height="200"
            src="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
            cover
          ></v-img>
          <v-card-title>Margin Calculator</v-card-title>
          <v-card-text>
            A powerful tool for cryptocurrency traders to calculate margin,
            stop-loss, and take-profit levels for their trades.
          </v-card-text>
          <v-card-actions>
            <v-btn to="/margin-calculator" color="primary" variant="tonal"
              >View Project</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- More project cards can be added here -->
    </v-row>

    <!-- About Section -->
    <v-row class="my-12">
      <v-col cols="12" md="6">
        <h2 class="text-h4 mb-6">About Me</h2>
        <p class="text-body-1 mb-4">
          I'm a software engineer with a passion for building clean, efficient,
          and user-friendly applications. I specialize in full-stack development
          using modern technologies and frameworks.
        </p>
        <p class="text-body-1">
          This portfolio showcases some of my recent projects and experiments.
          Feel free to explore!
        </p>
      </v-col>
      <v-col cols="12" md="6">
        <v-card flat>
          <v-card-title>Skills</v-card-title>
          <v-card-text>
            <v-chip-group>
              <v-chip color="primary" outlined>JavaScript</v-chip>
              <v-chip color="primary" outlined>TypeScript</v-chip>
              <v-chip color="primary" outlined>Vue.js</v-chip>
              <v-chip color="primary" outlined>Node.js</v-chip>
              <v-chip color="primary" outlined>RESTful APIs</v-chip>
              <v-chip color="primary" outlined>SQL</v-chip>
              <v-chip color="primary" outlined>NoSQL</v-chip>
              <v-chip color="primary" outlined>Git</v-chip>
            </v-chip-group>
          </v-card-text>
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
