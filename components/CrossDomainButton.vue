<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

const config = useRuntimeConfig();
const router = useRouter();
const route = useRoute();

type ButtonVariant =
  | "flat"
  | "text"
  | "elevated"
  | "tonal"
  | "outlined"
  | "plain";
type ButtonSize = "x-small" | "small" | "default" | "large" | "x-large";
type ClassValue =
  | string
  | Record<string, boolean>
  | (string | Record<string, boolean>)[];

const props = defineProps<{
  /** The route to navigate to. Can be a string path or route object */
  to: RouteLocationRaw;
  /** Whether this is an external link that should open in a new tab */
  external?: boolean;
  /** Button color. Maps to Vuetify color system */
  color?: string;
  /** Additional CSS classes to apply to the button */
  className?: ClassValue;
  /** Button size. One of: 'x-small', 'small', 'default', 'large', 'x-large' */
  size?: ButtonSize;
  /** Button variant style. One of: 'flat', 'text', 'elevated', 'tonal', 'outlined', 'plain' */
  variant?: ButtonVariant;
  /** Icon to display (for icon-only buttons) */
  icon?: string;
  /** Icon to prepend before button content */
  prependIcon?: string;
  /** Icon to append after button content */
  appendIcon?: string;
  /** Whether button should take up full width */
  block?: boolean;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether route matching should be exact */
  exact?: boolean;
}>();

const resolvedRoute = computed(() => {
  if (typeof props.to === "string") {
    return { path: props.to };
  }
  return props.to;
});

const isActive = computed(() => {
  const resolved = router.resolve(resolvedRoute.value);
  if (props.exact) {
    return route.path === resolved.path;
  }
  return route.path.startsWith(resolved.path);
});

const computedClass = computed(() => {
  const classes = [props.className];
  if (isActive.value) {
    classes.push("v-btn--active");
  }
  return classes;
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
  if (props.external || props.disabled) {
    return;
  }

  e.preventDefault();
  window.location.href = href.value || "";
};
</script>

<template>
  <v-btn
    :href="href"
    @click="handleClick"
    :color="color"
    :class="computedClass"
    :size="size"
    :variant="variant"
    :icon="icon"
    :prepend-icon="prependIcon"
    :append-icon="appendIcon"
    :block="block"
    :disabled="disabled"
  >
    <slot></slot>
  </v-btn>
</template>

<style scoped>
.v-btn--active {
  opacity: 1;
  background-color: rgb(var(--v-theme-primary), 0.12);
}
</style>
