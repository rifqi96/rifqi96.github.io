<script setup lang="ts">
// Import components directly with relative paths
import HeroSection from "@domains/home/components/HeroSection.vue";
import StatsSection from "@domains/home/components/StatsSection.vue";
import FeaturedProjects from "@domains/home/components/FeaturedProjects.vue";
import AboutSection from "@domains/home/components/AboutSection.vue";
import SkillsSection from "@domains/home/components/SkillsSection.vue";
import ExperienceSection from "@domains/home/components/ExperienceSection.vue";
import ContactSection from "@domains/home/components/ContactSection.vue";

// Home page (Landing page)
definePageMeta({
  layout: "default",
});

// SEO metadata
useHead({
  title: "Home",
  meta: [
    {
      name: "description",
      content:
        "Personal website and portfolio of Rifqi Ruhyattamam, Software Engineer specializing in modern web applications.",
    },
  ],
});

// Use ClientOnly to handle browser-side interactions
const isClient = process.client;

// Initialize refs with default values for SSR
const windowHeight = ref(0);
const scrollPosition = ref(0);

// Create client-only functions for window access
const handleScroll = () => {
  if (process.client) {
    scrollPosition.value = window.scrollY;
  }
};

// Update window dimensions
const handleResize = () => {
  if (process.client) {
    windowHeight.value = window.innerHeight;
  }
};

// Set up the visibility observer for animations
const { observe } = useVisibilityObserver();

// References to sections for visibility tracking
const heroSectionRef = ref(null);
const statsSectionRef = ref(null);
const projectsSectionRef = ref(null);
const aboutSectionRef = ref(null);
const skillsSectionRef = ref(null);
const experienceSectionRef = ref(null);
const contactSectionRef = ref(null);

// Set up observers for sections
onMounted(async () => {
  if (process.client) {
    // Set up scroll listener for parallax effect
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Set initial values
    handleScroll();
    handleResize();

    // Wait for DOM to update before setting up visibility
    await nextTick();

    // Set up observers for scroll animations
    observe(heroSectionRef.value);
    observe(statsSectionRef.value);
    observe(projectsSectionRef.value);
    observe(aboutSectionRef.value);
    observe(skillsSectionRef.value);
    observe(experienceSectionRef.value);
    observe(contactSectionRef.value);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleResize);
  }
});
</script>

<template>
  <!-- Main Content -->
  <div class="home-content home-view">
    <!-- Hero Section with Parallax -->
    <div ref="heroSectionRef" class="section-animation">
      <HeroSection :scroll-position="scrollPosition" />
    </div>

    <!-- Stats Section -->
    <div ref="statsSectionRef" class="section-animation">
      <StatsSection />
    </div>

    <!-- Projects Section -->
    <div ref="projectsSectionRef" class="section-animation">
      <FeaturedProjects />
    </div>

    <!-- About Section -->
    <div ref="aboutSectionRef" class="section-animation">
      <AboutSection :scroll-position="scrollPosition" />
    </div>

    <!-- Skills Section -->
    <div ref="skillsSectionRef" class="section-animation">
      <SkillsSection />
    </div>

    <!-- Experience Section -->
    <div ref="experienceSectionRef" class="section-animation">
      <ExperienceSection />
    </div>

    <!-- Contact Section -->
    <div ref="contactSectionRef" class="section-animation">
      <ContactSection />
    </div>
  </div>
</template>

<style scoped>
/* General styles */
.home-content {
  overflow-x: hidden;
  height: auto;
  overflow-y: hidden;
}

.section-animation {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}

.section-visible {
  opacity: 1;
  transform: translateY(0);
}

.loading-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  font-size: 1.5rem;
}
</style>

<!-- Add this global style to override Vuetify's default -->
<style>
.home-view {
  margin-top: calc(-1 * var(--v-layout-top));
}
</style>
