<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import HeroSection from "../components/HeroSection.vue";
import StatsSection from "../components/StatsSection.vue";
import FeaturedProjects from "../components/FeaturedProjects.vue";
import AboutSection from "../components/AboutSection.vue";
import SkillsSection from "../components/SkillsSection.vue";
import ExperienceSection from "../components/ExperienceSection.vue";
import ContactSection from "../components/ContactSection.vue";
import { useVisibilityObserver } from "../composables/useVisibilityObserver";

// Get window dimensions for parallax effect
const windowHeight = ref(window.innerHeight);
const scrollPosition = ref(0);

// Update scroll position for parallax effects
const handleScroll = () => {
  scrollPosition.value = window.scrollY;
};

// Update window dimensions
const handleResize = () => {
  windowHeight.value = window.innerHeight;
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
  document.title = "Rifqi Ruhyattamam | Software Engineer";

  // Set up scroll listener for parallax effect
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", handleResize);

  // Set initial values
  handleScroll();
  handleResize();

  // Wait for DOM to update before setting up visibility
  await nextTick();

  // Remove the section that immediately makes sections visible
  // const sections = document.querySelectorAll(".section-animation");
  // sections.forEach((section) => {
  //   section.classList.add("section-visible");
  // });

  // Set up observers for scroll animations
  observe(heroSectionRef.value);
  observe(statsSectionRef.value);
  observe(projectsSectionRef.value);
  observe(aboutSectionRef.value);
  observe(skillsSectionRef.value);
  observe(experienceSectionRef.value);
  observe(contactSectionRef.value);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleResize);
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
</style>

<!-- Add this global style to override Vuetify's default -->
<style>
.home-view {
  margin-top: calc(-1 * var(--v-layout-top));
}
</style>
