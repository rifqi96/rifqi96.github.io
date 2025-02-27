<script setup lang="ts">
import { onMounted } from "vue";
import { useDataLoader } from "@/domains/home/composables/useDataLoader";

const { getFeaturedProjects, loadData } = useDataLoader();

// Load projects data on component mount
onMounted(async () => {
  await loadData();
});
</script>

<template>
  <section class="projects-section section-animation">
    <v-container>
      <div class="section-header">
        <h2 class="section-title">Featured Projects</h2>
        <div class="section-divider"></div>
        <p class="section-description">
          A selection of my recent work and experiments
        </p>
      </div>

      <v-row class="mt-8">
        <!-- Dynamic Project Cards from CSV -->
        <v-col
          v-for="(project, index) in getFeaturedProjects"
          :key="index"
          cols="12"
          md="6"
          lg="4"
        >
          <div class="project-card">
            <div class="project-image">
              <v-img
                :src="project.image"
                height="240"
                cover
                class="rounded-lg"
              ></v-img>
              <div class="project-overlay">
                <a v-if="project.link" :href="project.link">
                  <v-btn color="primary" variant="elevated">
                    View Project
                  </v-btn>
                </a>
                <v-btn v-else disabled color="primary" variant="elevated"
                  >Coming Soon</v-btn
                >
              </div>
            </div>
            <div class="project-content">
              <h3 class="project-title">{{ project.title }}</h3>
              <p class="project-description">
                {{ project.description }}
              </p>
              <div class="project-tags">
                <v-chip
                  v-for="(tech, techIndex) in project.technologies"
                  :key="techIndex"
                  size="small"
                  color="primary"
                  variant="outlined"
                  class="mr-1 mb-1"
                >
                  {{ tech }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <div class="text-center mt-12">
        <v-btn to="/projects" color="primary" size="large" variant="tonal"
          >View All Projects</v-btn
        >
      </div>
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
  -webkit-text-fill-color: transparent;
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

/* Projects Section */
.projects-section {
  padding: 120px 0;
  background-color: #f9f9f9;
}

.project-card {
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  background: white;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.project-image {
  position: relative;
  overflow: hidden;
}

.project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover .project-overlay {
  opacity: 1;
}

.project-content {
  padding: 24px;
}

.project-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.project-description {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.6;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
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
  .projects-section {
    padding: 80px 0;
  }

  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 600px) {
  .projects-section {
    padding: 60px 0;
  }
}
</style>
@/domains/home/composables/useDataLoader
