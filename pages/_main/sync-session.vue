<script setup lang="ts">
import { useAuth } from "@/domains/auth/composables/useAuth";

// Page to handle session synchronization between domains
definePageMeta({
  layout: "default",
});

const route = useRoute();
const redirectUrl = route.query.redirect as string;
const { initAuth } = useAuth();

// Get the session from localStorage
const session = ref(null);
const error = ref(null);
onMounted(async () => {
  try {
    const localSession = localStorage.getItem("sb-auth");
    console.log("Sync session - Local session found:", !!localSession);

    if (localSession) {
      session.value = JSON.parse(localSession);
      // Initialize auth state before redirecting
      await initAuth();
      console.log("Sync session - Auth state initialized");

      // Redirect with session data
      if (redirectUrl) {
        const url = new URL(redirectUrl);
        url.searchParams.append("session", encodeURIComponent(localSession));
        console.log("Sync session - Redirecting to:", url.toString());
        window.location.replace(url.toString());
      }
    } else {
      // No session found, redirect to login
      const config = useRuntimeConfig();
      const authDomain = config.public.authDomain;
      const protocol = authDomain.startsWith("localhost")
        ? "http://"
        : "https://";
      const authUrl = `${protocol}${authDomain}/login?redirect=${encodeURIComponent(
        redirectUrl,
      )}`;
      console.log(
        "Sync session - No session found, redirecting to login:",
        authUrl,
      );
      window.location.replace(authUrl);
    }
  } catch (err: any) {
    console.error("Error during session sync:", err);
    error.value = err.message || "Failed to sync session";
    // Clear any invalid session data
    localStorage.removeItem("sb-auth");
    const authCookie = useCookie("sb-auth");
    authCookie.value = null;
  }
});

const reload = () => {
  window.location.reload();
};
</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4" class="text-center">
        <template v-if="!error">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <div class="mt-4">
            <h2 class="text-h6">Syncing session...</h2>
            <p class="text-body-1 mt-2">
              Please wait while we sync your session.
            </p>
          </div>
        </template>
        <template v-else>
          <v-alert type="error" class="mb-4">
            {{ error }}
          </v-alert>
          <v-btn color="primary" @click="reload()"> Retry </v-btn>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>
