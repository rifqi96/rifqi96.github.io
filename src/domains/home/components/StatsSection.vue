<script setup lang="ts">
import { ref, onMounted } from "vue";

// Stats data
const yearsCount = ref<number>(0);
const projectsCount = ref<number>(0);
const experienceYears = 8; // Adjust based on your experience
const completedProjects = 35; // Adjust based on your portfolio

// For animated counting
const startCountingAnimation = () => {
  // Animate years count
  const yearsInterval = setInterval(() => {
    if (yearsCount.value < experienceYears) {
      yearsCount.value += 1;
    } else {
      clearInterval(yearsInterval);
    }
  }, 200);

  // Animate projects count
  const projectsInterval = setInterval(() => {
    if (projectsCount.value < completedProjects) {
      projectsCount.value += 1;
    } else {
      clearInterval(projectsInterval);
    }
  }, 20);
};

// Start animation when component is mounted
onMounted(() => {
  // Use a small delay to ensure animation starts after the component is visible
  setTimeout(() => {
    startCountingAnimation();
  }, 500);
});
</script>

<template>
  <section class="stats-section">
    <v-container>
      <v-row justify="center">
        <v-col cols="6" md="3" class="stat-item text-center">
          <h3 class="stat-number">{{ yearsCount }}+</h3>
          <p class="stat-label">Years Experience</p>
        </v-col>
        <v-col cols="6" md="3" class="stat-item text-center">
          <h3 class="stat-number">{{ projectsCount }}+</h3>
          <p class="stat-label">Projects Completed</p>
        </v-col>
        <v-col cols="6" md="3" class="stat-item text-center">
          <h3 class="stat-number">12+</h3>
          <p class="stat-label">Technologies Mastered</p>
        </v-col>
        <v-col cols="6" md="3" class="stat-item text-center">
          <h3 class="stat-number">100%</h3>
          <p class="stat-label">Client Satisfaction</p>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<style scoped>
/* Stats Section */
.stats-section {
  padding: 80px 0;
  background-color: white;
}

.stat-item {
  padding: 32px 16px;
}

.stat-number {
  font-size: 3rem !important;
  font-weight: 700 !important;
  margin-bottom: 8px !important;
  display: block !important;
  color: #6200ea !important; /* Fallback for browsers that don't support gradient text */
  background: linear-gradient(135deg, #7c4dff, #6200ea) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}

.stat-label {
  font-size: 1.1rem;
  color: #666;
}

/* Animation for section */
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

/* Media Queries */
@media (max-width: 960px) {
  .stat-number {
    font-size: 2.5rem;
  }
}
</style>
