<script setup lang="ts">
import MarginCalc from "@/domains/margin-calculator/components/MarginCalc.vue";

// Margin calculator page
definePageMeta({
  layout: "default",
});

// SEO metadata
useHead({
  title: "Margin Calculator | Rifqi Ruhyattamam",
  meta: [
    {
      name: "description",
      content:
        "A powerful tool for cryptocurrency traders to calculate margin, stop-loss, and take-profit levels.",
    },
  ],
});
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" class="text-center">
        <h1 class="text-h3 mb-4">Margin Calculator</h1>
        <p class="text-subtitle-1 mb-6">
          A powerful tool for cryptocurrency traders to calculate margin,
          stop-loss, and take-profit levels.
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <MarginCalc />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
@media (min-width: 1280px) {
  .v-container {
    max-width: 1600px;
  }
}

.loading-calculator {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 1.5rem;
}
</style>
