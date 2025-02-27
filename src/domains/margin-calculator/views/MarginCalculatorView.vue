<script setup lang="ts">
import { onMounted } from "vue";
import MarginCalc from "@/domains/margin-calculator/components/MarginCalc.vue";

// Update page title when the component is mounted
onMounted(() => {
  document.title = "Margin Calculator | Rifqi Ruhyattamam";
});
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
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
</style>
