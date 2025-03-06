<script setup lang="ts">
import { blogPost as blogService } from "@/domains/console/services/blogPost.service";
import { projectService } from "@/domains/console/services/project.service";
import { userService } from "@/domains/console/services/user.service";
import { experienceService } from "@/domains/console/services/workExperience.service";
import { whitelistService } from "@/domains/console/services/whitelist.service";

// Dashboard page
definePageMeta({
  layout: "console",
  middleware: ["auth"],
  meta: {
    requireRole: "superadmin",
  },
});

// SEO metadata
useHead({
  title: "Admin Dashboard",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

// Dashboard stats
const stats = ref({
  blogPosts: 0,
  projects: 0,
  workExperiences: 0,
  users: 0,
  whitelistedUsers: 0,
});

// Loading state
const loading = ref(true);
const error = ref<string | null>(null);

// Load dashboard data
const loadDashboardData = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Fetch data in parallel
    const [posts, projects, experiences, users, whitelistedUsers] =
      await Promise.all([
        blogService.getAllPosts(),
        projectService.getAllProjects(),
        experienceService.getAllExperiences(),
        userService.getAllUsers(),
        whitelistService.getAllEntries(),
      ]);

    // Update stats
    stats.value = {
      blogPosts: posts.length,
      projects: projects.length,
      workExperiences: experiences.length,
      users: users.length,
      whitelistedUsers: whitelistedUsers.length,
    };
  } catch (err: any) {
    console.error("Failed to load dashboard data:", err);
    error.value = err.message || "Failed to load dashboard data";
  } finally {
    loading.value = false;
  }
};

// Load data on mount
onMounted(async () => {
  await loadDashboardData();
});
</script>

<template>
  <div>
    <h1 class="text-h4 mb-6">Admin Dashboard</h1>

    <v-alert v-if="error" type="error" class="mb-6">
      {{ error }}
      <div class="mt-2">
        <v-btn color="white" @click="loadDashboardData" size="small"
          >Retry</v-btn
        >
      </div>
    </v-alert>

    <!-- Dashboard stats -->
    <v-row class="d-flex flex-wrap">
      <v-col
        v-for="(stat, key) in [
          {
            key: 'blogPosts',
            title: 'Blog Posts',
            icon: 'mdi-post',
            color: 'primary',
          },
          {
            key: 'projects',
            title: 'Projects',
            icon: 'mdi-briefcase',
            color: 'secondary',
          },
          {
            key: 'workExperiences',
            title: 'Work Experience',
            icon: 'mdi-account-tie',
            color: 'warning',
          },
          {
            key: 'users',
            title: 'Users',
            icon: 'mdi-account-group',
            color: 'info',
          },
          {
            key: 'whitelistedUsers',
            title: 'Whitelisted Users',
            icon: 'mdi-account-check',
            color: 'success',
          },
        ]"
        :key="key"
        cols="12"
        sm="6"
        style="flex: 1 1 0; min-width: 200px"
      >
        <v-card :loading="loading" class="h-100">
          <v-card-item>
            <template v-slot:prepend>
              <v-icon :color="stat.color" size="large">{{ stat.icon }}</v-icon>
            </template>
            <v-card-title>{{ stat.title }}</v-card-title>
            <v-card-subtitle class="text-h4 mt-2">
              {{ stats[stat.key as keyof typeof stats] }}
            </v-card-subtitle>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick links -->
    <h2 class="text-h5 mt-8 mb-4">Quick Actions</h2>
    <v-row class="d-flex flex-wrap">
      <v-col
        v-for="action in [
          {
            title: 'New Blog Post',
            icon: 'mdi-pencil',
            to: '/blog/new',
            color: 'primary',
          },
          {
            title: 'New Project',
            icon: 'mdi-plus-circle',
            to: '/projects/new',
            color: 'secondary',
          },
          {
            title: 'Manage Work Experience',
            icon: 'mdi-briefcase',
            to: '/experience',
            color: 'success',
          },
          {
            title: 'Manage Users',
            icon: 'mdi-account-cog',
            to: '/users',
            color: 'info',
          },
          {
            title: 'Site Settings',
            icon: 'mdi-cog',
            to: '/settings',
            color: 'warning',
          },
        ]"
        :key="action.title"
        cols="12"
        sm="6"
        style="flex: 1 1 0; min-width: 200px"
      >
        <v-card :to="action.to" hover class="h-100">
          <v-card-item>
            <template v-slot:prepend>
              <v-icon :color="action.color" size="large">{{
                action.icon
              }}</v-icon>
            </template>
            <v-card-title>{{ action.title }}</v-card-title>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.v-card {
  transition: transform 0.2s ease;
}

.v-card:hover {
  transform: translateY(-5px);
}
</style>
