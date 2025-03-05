<script setup lang="ts">
import { useAuth } from "../composables/useAuth";
import LoginDialog from "./LoginDialog.vue";

const showLoginDialog = ref(false);
const { initAuth, isAuthenticated } = useAuth();
const initialized = ref(false);

onMounted(async () => {
  try {
    // Initialize auth state first
    await initAuth();
  } catch (error) {
    console.error("Error initializing auth:", error);
  } finally {
    initialized.value = true;
  }
});

const requireAuth = async () => {
  // Wait for initialization
  if (!initialized.value) {
    await new Promise((resolve) => {
      const checkInit = () => {
        if (initialized.value) {
          resolve(true);
        } else {
          setTimeout(checkInit, 50);
        }
      };
      checkInit();
    });
  }
  return isAuthenticated.value;
};

defineExpose({
  requireAuth,
});
</script>

<template>
  <div v-if="initialized" class="auth-provider">
    <!-- Authentication dialog -->
    <LoginDialog v-model:show="showLoginDialog" @login="initAuth" />

    <!-- Content slot for the rest of the app -->
    <slot></slot>
  </div>
</template>
