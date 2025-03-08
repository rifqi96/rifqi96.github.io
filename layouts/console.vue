<script setup lang="ts">
import { useAuth } from "@/domains/auth/composables/useAuth";

const config = useRuntimeConfig();
const mainDomain = config.public.mainDomain;
const authDomain = config.public.authDomain;

// Custom layout for the admin console
const drawer = ref(true);
const rail = ref(false);
const { user, isAuthenticated, isSuperAdmin, signOut } = useAuth();

// Navigation items
const navItems = [
  { title: "Dashboard", icon: "mdi-view-dashboard", to: "/" },
  { title: "Blog Posts", icon: "mdi-post-outline", to: "/blog" },
  { title: "Projects", icon: "mdi-briefcase", to: "/projects" },
  {
    title: "Work Experience",
    icon: "mdi-account-tie",
    to: "/experience",
  },
  { title: "Users", icon: "mdi-account-group", to: "/users" },
  { title: "Settings", icon: "mdi-cog", to: "/settings" },
];

// Handle logout
const handleLogout = async () => {
  await signOut();
};

// Check if the user is authorized
onMounted(async () => {
  const { initAuth } = useAuth();
  await initAuth();

  if (!isAuthenticated.value || !isSuperAdmin.value) {
    // Redirect unauthorized users to the auth domain
    navigateTo(authDomain);
  }
});

// Get the current route to highlight active nav item
const route = useRoute();
</script>

<template>
  <v-app v-if="isAuthenticated && isSuperAdmin">
    <!-- Navigation drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
    >
      <v-list-item
        prepend-avatar="/avatar.png"
        :title="user?.full_name || user?.email"
        :subtitle="user?.role"
        class="py-4"
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          :active="route.path.startsWith(item.to)"
          rounded="lg"
          class="mb-1"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn
            block
            color="error"
            prepend-icon="mdi-logout"
            @click="handleLogout"
          >
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- App bar -->
    <v-app-bar color="primary" density="comfortable">
      <v-app-bar-title>Admin Console</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon :href="mainDomain" target="_blank" title="View Site">
        <v-icon>mdi-web</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Main content -->
    <v-main class="bg-grey-lighten-4">
      <v-container fluid>
        <slot></slot>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.v-navigation-drawer :deep(.v-list-item--active) {
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

.v-navigation-drawer :deep(.v-list-item--active .v-icon) {
  color: rgb(var(--v-theme-primary));
}
</style>
