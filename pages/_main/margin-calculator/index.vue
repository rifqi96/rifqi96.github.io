<script setup lang="ts">
import MarginCalc from "@/domains/margin-calculator/components/MarginCalc.vue";
import AuthProvider from "@/domains/auth/components/AuthProvider.vue";

// Margin calculator page
definePageMeta({
  layout: "default",
  middleware: ["auth"],
  meta: {
    requireWhitelist: true,
  },
});

// SEO metadata
useHead({
  title: "Margin Calculator",
  meta: [
    {
      name: "description",
      content:
        "A powerful tool for cryptocurrency traders to calculate margin, stop-loss, and take-profit levels.",
    },
  ],
});

// Reference to the auth provider component
const authProviderRef = ref<InstanceType<typeof AuthProvider> | null>(null);

// Reference to the margin calculator component
const marginCalcRef = ref<InstanceType<typeof MarginCalc> | null>(null);

// Initialize the auth provider
onMounted(() => {
  // Set up auth provider reference for margin calculator
  if (marginCalcRef.value && authProviderRef.value) {
    marginCalcRef.value.authProvider = authProviderRef.value;
  }
});
</script>

<template>
  <AuthProvider ref="authProviderRef">
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
        <v-col cols="12" class="margin-calc-wrapper">
          <MarginCalc ref="marginCalcRef" />
        </v-col>
      </v-row>
    </v-container>
  </AuthProvider>
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
