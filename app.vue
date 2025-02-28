<script setup lang="ts">
import { Analytics } from "@vercel/analytics/nuxt";
// Main application entry point
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
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
