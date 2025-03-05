<script setup lang="ts">
const config = useRuntimeConfig();
const mainDomain = config.public.mainDomain;

// Not authorized page
definePageMeta({
  layout: "default",
});

// SEO metadata
useHead({
  title: "Not Authorized",
  meta: [
    {
      name: "description",
      content: "You do not have permission to access this resource",
    },
    { name: "robots", content: "noindex, nofollow" },
  ],
});
</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="10" md="8" lg="6" class="text-center">
        <v-icon
          icon="mdi-shield-alert"
          color="warning"
          size="64"
          class="mb-4"
        ></v-icon>

        <h1 class="text-h4 mb-4">Access Denied</h1>

        <p class="text-body-1 mb-6">
          You don't have permission to access this resource. If you believe this
          is an error, please contact the site administrator.
        </p>

        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-home"
          :href="mainDomain"
        >
          Return to Homepage
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-container {
  padding-top: 0;
  padding-bottom: 0;
}
</style>
