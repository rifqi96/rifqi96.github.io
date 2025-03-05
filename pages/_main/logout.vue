<script setup lang="ts">
import { useAuth } from "@/domains/auth/composables/useAuth";

const { signOut } = useAuth();
const config = useRuntimeConfig();

// Execute logout on mount
onMounted(async () => {
  await signOut();

  // Check if we're not already on the auth domain
  if (window.location.hostname !== config.public.authDomain) {
    const authDomainPrefix = config.public.authDomain.startsWith("localhost")
      ? `http://${config.public.authDomain}`
      : config.public.authDomain;
    window.location.replace(`${authDomainPrefix}/login`);
  }
});
</script>

<template>
  <div class="d-flex align-center justify-center" style="height: 100vh">
    <v-progress-circular indeterminate color="primary" />
    <span class="ml-4">Logging out...</span>
  </div>
</template>
