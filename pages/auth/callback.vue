<script setup lang="ts">
import { useAuth } from "@/domains/auth/composables/useAuth";

// Auth callback page - handles OAuth redirects
definePageMeta({
  layout: "default",
});

// SEO metadata
useHead({
  title: "Authenticating...",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const { loading, error, handleAuthCallback } = useAuth();

// Process authentication on mount
onMounted(async () => {
  await handleAuthCallback();
});
</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4" class="text-center">
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>

        <v-alert v-else-if="error" type="error" class="mt-4">
          {{ error }}
          <div class="mt-4">
            <v-btn color="primary" to="/auth/login"> Return to Login </v-btn>
          </div>
        </v-alert>

        <div v-else>
          <h1 class="text-h5 mb-4">Authentication Complete</h1>
          <p class="text-body-1">Redirecting you...</p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
