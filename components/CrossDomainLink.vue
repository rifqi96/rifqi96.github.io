<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

const config = useRuntimeConfig();
const router = useRouter();

const props = defineProps<{
  to: RouteLocationRaw;
  external?: boolean;
}>();

const resolvedRoute = computed(() => {
  if (typeof props.to === "string") {
    return { path: props.to };
  }
  return props.to;
});

const href = computed(() => {
  // If it's an external link, return as is
  if (props.external) {
    return typeof props.to === "string" ? props.to : props.to.path;
  }

  const route = router.resolve(resolvedRoute.value);

  // Check if we need to navigate to a different subdomain
  const targetSubdomain = (route.meta?.subdomain as string) || "";
  if (!targetSubdomain || targetSubdomain === "_main") {
    // If no subdomain or main domain, use the main domain
    return `${config.public.baseURL}${route.path}`;
  }

  // For auth subdomain
  if (targetSubdomain === "auth") {
    return `${config.public.authDomain}${route.path}`;
  }

  // For console subdomain
  if (targetSubdomain === "console") {
    return `${config.public.consoleDomain}${route.path}`;
  }

  // Default to current domain
  return route.path;
});

const handleClick = (e: MouseEvent) => {
  if (props.external) {
    return;
  }

  e.preventDefault();
  window.location.href = href.value || "";
};
</script>

<template>
  <a :href="href" @click="handleClick">
    <slot></slot>
  </a>
</template>

<style scoped>
a {
  text-decoration: none;
  color: inherit;
}
</style>
