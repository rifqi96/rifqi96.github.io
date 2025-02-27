<script setup lang="ts">
// This is the main layout component that wraps all pages
</script>

<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>
        <router-link to="/" class="text-white text-decoration-none">
          Rifqi Ruhyattamam
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn to="/" variant="text">Home</v-btn>
      <v-btn to="/projects" variant="text">Projects</v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <v-list-item to="/" title="Home"></v-list-item>
        <v-list-item to="/projects" title="Projects"></v-list-item>
        <v-divider></v-divider>
        <v-list-item
          to="/margin-calculator"
          title="Margin Calculator"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>

    <v-footer app padless class="mt-auto">
      <v-container>
        <v-row no-gutters>
          <v-col class="text-center" cols="12">
            &copy; {{ new Date().getFullYear() }} — Rifqi Ruhyattamam
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
export default {
  data() {
    return {
      drawer: false,
    };
  },
};
</script>

<style scoped>
/* Add any layout-specific styles here */
</style>
