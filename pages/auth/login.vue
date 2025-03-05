<script setup lang="ts">
import { useAuth } from "@/domains/auth/composables/useAuth";

const config = useRuntimeConfig();
const mainDomain = config.public.mainDomain;

// Auth login page
definePageMeta({
  layout: "default",
});

// SEO metadata
useHead({
  title: "Sign In",
  meta: [
    {
      name: "description",
      content: "Sign in to access Rifqi Ruhyattamam's protected features",
    },
  ],
});

const { loading, error, isAuthenticated, signInWithGoogle } = useAuth();
const rememberMe = ref(true);

// Check if already authenticated and redirect if needed
onMounted(async () => {
  const { initAuth } = useAuth();
  await initAuth();

  if (isAuthenticated.value) {
    // Already authenticated, redirect to home
    return navigateTo(mainDomain);
  }
});

const handleGoogleLogin = async () => {
  await signInWithGoogle({ rememberMe: rememberMe.value });
};
</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" md="6" lg="4">
        <v-card class="auth-card">
          <v-card-item class="text-center pt-8">
            <v-img
              src="/logo.svg"
              alt="Rifqi Ruhyattamam"
              width="200"
              class="mx-auto mb-4"
            />
            <h1 class="text-h5 mb-2">Sign In</h1>
            <p class="text-body-1 text-medium-emphasis mb-6">
              Authentication required to continue
            </p>
          </v-card-item>

          <v-card-text>
            <v-alert v-if="error" type="error" class="mb-4" closable>
              {{ error }}
            </v-alert>

            <v-checkbox
              :model-value="rememberMe ?? false"
              @update:model-value="(val) => (rememberMe = val ?? false)"
              label="Keep me signed in"
              color="primary"
              hide-details
              class="mb-6"
            ></v-checkbox>

            <v-btn
              block
              color="primary"
              size="large"
              prepend-icon="mdi-google"
              :loading="loading"
              @click="handleGoogleLogin"
              class="mb-4"
            >
              Sign in with Google
            </v-btn>
          </v-card-text>

          <v-card-text
            class="text-center text-caption text-medium-emphasis pt-0"
          >
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.auth-card {
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}
</style>
