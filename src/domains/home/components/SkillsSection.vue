<script setup lang="ts">
// Skills list
const technologies = [
  { name: "Vue.js", level: 95, icon: "mdi-vuejs" },
  { name: "Nuxt.js", level: 95, icon: "mdi-nuxt" },
  { name: "TypeScript", level: 90, icon: "mdi-language-typescript" },
  { name: "JavaScript", level: 90, icon: "mdi-language-javascript" },
  { name: "Laravel", level: 95, icon: "mdi-laravel" },
  { name: "Python", level: 80, icon: "mdi-language-python" },
  { name: "PostgreSQL", level: 80, icon: "mdi-database" },
  { name: "Redis", level: 75, icon: "mdi-database" },
  { name: "AWS", level: 75, icon: "mdi-aws" },
  { name: "Docker", level: 80, icon: "mdi-docker" },
  { name: "DevOps", level: 70, icon: "mdi-cog-refresh" },
  { name: "Full Stack", level: 90, icon: "mdi-layers" },
];
</script>

<template>
  <section class="skills-section">
    <v-container>
      <div class="section-header">
        <h2 class="section-title">Technical Expertise</h2>
        <div class="section-divider"></div>
        <p class="section-description">
          Technologies and tools I've mastered throughout my career
        </p>
      </div>

      <v-row class="mt-8">
        <v-col
          v-for="(tech, index) in technologies"
          :key="index"
          cols="12"
          sm="6"
          md="4"
          class="skill-item"
        >
          <div class="skill-card">
            <div class="skill-header">
              <v-icon :icon="tech.icon" color="primary" size="large"></v-icon>
              <h3 class="skill-name">{{ tech.name }}</h3>
            </div>

            <div class="skill-progress-container">
              <div class="skill-progress-bg">
                <div
                  class="skill-progress-fill"
                  :style="{ '--progress-width': `${tech.level}%` }"
                >
                  <span class="skill-progress-label">{{ tech.level }}%</span>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<style scoped>
/* Section styling */
.section-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 40px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--v-primary-base), #6200ea);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: #6200ea;
}

.section-divider {
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, var(--v-primary-base), #6200ea);
  margin: 0 auto 16px;
  border-radius: 4px;
}

.section-description {
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

/* Skills Section */
.skills-section {
  padding: 120px 0;
  background-color: #f9f9f9;
}

.skill-item {
  margin-bottom: 24px;
}

.skill-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  height: 100%;
  transition: transform 0.3s ease;
}

.skill-card:hover {
  transform: translateY(-5px);
}

.skill-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.skill-header i {
  margin-right: 16px;
}

.skill-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-left: 16px;
}

.skill-progress-container {
  margin-top: 12px;
}

.skill-progress-bg {
  height: 10px;
  background-color: #eee;
  border-radius: 5px;
  overflow: hidden;
}

.skill-progress-fill {
  height: 100%;
  background: linear-gradient(to right, #7c4dff, #6200ea);
  border-radius: 5px;
  position: relative;
  width: var(
    --progress-width
  ) !important; /* Remove width: 0 and use the variable directly */
  transition: width 1.5s ease;
}

@keyframes progress-fill {
  to {
    width: var(--progress-width) !important;
  }
}

.skill-progress-label {
  position: absolute;
  right: 8px;
  top: -20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6200ea;
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
  .skills-section {
    padding: 80px 0;
  }

  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 600px) {
  .skills-section {
    padding: 60px 0;
  }
}
</style>
