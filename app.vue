<script setup lang="ts">
import { Analytics } from "@vercel/analytics/nuxt";
import AuthProvider from "@/domains/auth/components/AuthProvider.vue";

// Main application entry point
const route = useRoute();

// Only initialize auth for non-auth pages to avoid circular imports
const isAuthPage = computed(() => {
  return route.path.startsWith("/auth/");
});
</script>

<template>
  <NuxtLayout>
    <AuthProvider v-if="!isAuthPage">
      <NuxtPage />
    </AuthProvider>
    <NuxtPage v-else />
    <Analytics />
  </NuxtLayout>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
}
</style>
