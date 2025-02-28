<script setup lang="ts">
const route = useRoute();
const drawer = ref(false);
const scrollPosition = ref(0);
const isScrolled = ref(false);
const isMobile = ref(false);
const isLoading = ref(false);
const loadingProgress = ref(0);
const loadingTimer = ref<number | null>(null);

// Check if we're in a section that should have a transparent navbar
const transparentNavbar = computed<boolean>(() => {
  return route.path === "/" && !isScrolled.value;
});

// Update scroll position
const updateScroll = () => {
  scrollPosition.value = window.scrollY;
  isScrolled.value = scrollPosition.value > 50;
};

// Check if we're on mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 960;
};

// Start loading progress animation
const startLoading = () => {
  isLoading.value = true;
  loadingProgress.value = 0;

  // Simulate progress with randomized increments
  const simulateProgress = () => {
    if (loadingProgress.value < 90) {
      // Random progress between 5-15%
      const increment = Math.random() * 10 + 5;
      loadingProgress.value = Math.min(loadingProgress.value + increment, 90);
      loadingTimer.value = window.setTimeout(simulateProgress, 200);
    }
  };

  simulateProgress();
};

// Complete loading progress
const completeLoading = () => {
  if (loadingTimer.value) {
    clearTimeout(loadingTimer.value);
    loadingTimer.value = null;
  }

  loadingProgress.value = 100;

  // Fade out the loader after completion
  setTimeout(() => {
    isLoading.value = false;
    loadingProgress.value = 0;
  }, 300);
};

// Close drawer when route changes
watch(
  () => route.path,
  () => {
    drawer.value = false;
  },
);

// Watch for router events
onMounted(() => {
  updateScroll();
  checkMobile();
  window.addEventListener("scroll", updateScroll);
  window.addEventListener("resize", checkMobile);

  // Set up navigation hooks
  const router = useRouter();

  router.beforeEach(() => {
    startLoading();
    return true;
  });

  router.afterEach(() => {
    completeLoading();
  });
});
</script>

<template>
  <v-app>
    <!-- Loading Bar -->
    <div v-if="isLoading" class="loading-bar-container">
      <div class="loading-bar" :style="{ width: `${loadingProgress}%` }"></div>
    </div>

    <!-- App Bar with glass effect when scrolled -->
    <v-app-bar
      :elevation="isScrolled ? 1 : 0"
      app
      :class="[
        'app-bar-transition',
        transparentNavbar ? 'bg-transparent' : 'glass-navbar',
        isScrolled ? 'scrolled' : '',
      ]"
    >
      <!-- Mobile only: Hamburger icon -->
      <v-app-bar-nav-icon
        v-if="isMobile"
        @click="drawer = !drawer"
        :color="transparentNavbar ? 'white' : 'primary'"
      ></v-app-bar-nav-icon>

      <!-- Logo / Name -->
      <v-toolbar-title>
        <NuxtLink
          to="/"
          class="logo-link"
          :style="{
            color: transparentNavbar ? 'white' : 'var(--v-primary-base)',
          }"
        >
          Rifqi Ruhyattamam
        </NuxtLink>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Desktop only: Navigation links -->
      <div v-if="!isMobile" class="desktop-nav">
        <v-btn
          to="/"
          class="nav-btn"
          :class="{ 'white--text': transparentNavbar }"
          >Home</v-btn
        >
        <v-btn
          to="/projects"
          class="nav-btn"
          :class="{ 'white--text': transparentNavbar }"
          >Projects</v-btn
        >
      </div>
    </v-app-bar>

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" app temporary>
      <div class="drawer-header py-6 px-4">
        <h3 class="text-h5">Rifqi Ruhyattamam</h3>
        <p class="text-subtitle-2">Software Engineer</p>
      </div>

      <v-divider></v-divider>

      <v-list nav>
        <v-list-item to="/" class="nav-item">
          <template v-slot:prepend>
            <v-icon>mdi-home</v-icon>
          </template>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>

        <v-list-item to="/projects" class="nav-item">
          <template v-slot:prepend>
            <v-icon>mdi-folder-multiple</v-icon>
          </template>
          <v-list-item-title>Projects</v-list-item-title>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4">
          <v-btn block color="primary" href="mailto:mail@rifqi.dev">
            Get In Touch
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <slot></slot>
    </v-main>

    <!-- Footer -->
    <v-footer class="mt-auto footer">
      <v-container>
        <v-row>
          <v-col cols="12" md="4" class="mb-4 mb-md-0">
            <h3 class="text-h6 mb-3">Rifqi Ruhyattamam</h3>
            <p class="text-body-2">
              Software Engineer focused on building elegant, performant
              applications using modern web technologies.
            </p>
          </v-col>

          <v-col cols="12" md="4" class="mb-4 mb-md-0">
            <h3 class="text-subtitle-1 mb-3">Links</h3>
            <div class="d-flex flex-column">
              <NuxtLink to="/" class="footer-link mb-1">Home</NuxtLink>
              <NuxtLink to="/projects" class="footer-link mb-1"
                >Projects</NuxtLink
              >
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <h3 class="text-subtitle-1 mb-3">Connect</h3>
            <div class="d-flex footer-social">
              <v-btn
                icon
                href="https://github.com/rifqi96"
                target="_blank"
                rel="noopener"
                aria-label="GitHub"
              >
                <v-icon>mdi-github</v-icon>
              </v-btn>
              <v-btn
                icon
                href="https://linkedin.com/in/rifqi-ruhyattamam"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
              >
                <v-icon>mdi-linkedin</v-icon>
              </v-btn>
              <v-btn
                icon
                href="https://twitter.com/rifqi_qi"
                target="_blank"
                rel="noopener"
                aria-label="Twitter"
              >
                <v-icon>mdi-twitter</v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <div class="text-center text-body-2">
          &copy; {{ new Date().getFullYear() }} — Rifqi Ruhyattamam. All rights
          reserved.
        </div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<style scoped>
/* General styles */
.app-bar-transition {
  transition: all 0.3s ease;
}

.glass-navbar {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(234, 234, 234, 0.8);
}

.bg-transparent {
  background-color: transparent !important;
  color: white;
}

.scrolled {
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.1);
}

/* Loading Bar */
.loading-bar-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background-color: rgba(50, 50, 50, 0.5);
  overflow: hidden;
  z-index: 2000;
}

.loading-bar {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--v-primary-base),
    var(--v-primary-lighten1)
  );
  transition: width 0.2s ease-out;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

/* Logo */
.logo-link {
  font-weight: 600;
  text-decoration: none;
  font-size: 1.3rem;
  letter-spacing: -0.5px;
  color: var(--v-primary-base);
  transition: color 0.3s ease;
}

.white--text {
  color: white !important;
}

.nav-btn {
  color: var(--v-primary-base);
  text-transform: none;
}

/* Drawer */
.drawer-header {
  background: linear-gradient(
    135deg,
    var(--v-primary-base),
    var(--v-primary-darken1)
  );
  color: white;
}

.nav-item {
  margin-bottom: 4px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

/* Page transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Footer */
.footer {
  background-color: #f8f9fa !important;
  color: #212529;
}

.footer-link {
  color: #495057;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--v-primary-base);
}

.footer-social {
  gap: 8px;
}
</style>
