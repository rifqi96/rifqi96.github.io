<script setup lang="ts">
// Hero section component for the home page
defineProps<{
  scrollPosition: number;
}>();
</script>

<template>
  <section class="hero-section">
    <div
      class="hero-content"
      :style="{ transform: `translateY(${scrollPosition * 0.4}px)` }"
    >
      <h1 class="hero-title">
        Rifqi <span class="accent-text">Ruhyattamam</span>
      </h1>
      <h2 class="hero-subtitle">Software Engineer</h2>
      <p class="hero-description">
        Creating elegant solutions through clean code and modern technologies
      </p>
      <div class="hero-actions">
        <v-btn to="/projects" size="large" color="primary" class="hero-btn mr-4"
          >View My Work</v-btn
        >
        <v-btn
          href="mailto:mail@rifqi.dev"
          size="large"
          variant="outlined"
          color="white"
          class="hero-btn"
          >Get In Touch</v-btn
        >
      </div>
    </div>
    <div class="scroll-indicator">
      <span>Scroll to explore</span>
      <v-icon>mdi-chevron-down</v-icon>
    </div>
    <div class="hero-background"></div>
  </section>
</template>

<style scoped>
/* Hero Section */
.hero-section {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #121212, #323232);
  z-index: -1;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  padding: 40px;
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 2rem;
  font-weight: 300;
  margin-bottom: 24px;
  opacity: 0.9;
}

.hero-description {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.8;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.hero-btn {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  border-radius: 12px;
  min-width: 160px;
}

.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.7;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0) translateX(-50%);
  }
  40% {
    transform: translateY(-15px) translateX(-50%);
  }
  60% {
    transform: translateY(-7px) translateX(-50%);
  }
}

.accent-text {
  color: var(--v-primary-base);
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
  .hero-title {
    font-size: 3.5rem;
  }

  .hero-subtitle {
    font-size: 1.5rem;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 2.8rem;
  }

  .hero-actions {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
