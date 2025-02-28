<script setup lang="ts">
import { useWorkExperience } from "@/domains/home/composables/useWorkExperience";

const { workExperience, status } = useWorkExperience();
const isLoading = computed(
  () => status.value === "pending" || status.value === "idle",
);
</script>

<template>
  <section class="experience-section">
    <v-container>
      <div class="section-header">
        <h2 class="section-title">Work Experience</h2>
        <div class="section-divider"></div>
        <p class="section-description">
          My professional journey and contributions
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4">Loading experience data...</p>
      </div>

      <div v-else class="timeline mt-12">
        <!-- Timeline Items - Dynamic rendering from CSV data -->
        <div
          v-for="(job, index) in workExperience"
          :key="index"
          class="timeline-item"
        >
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-date">
              {{ job.startDate }} - {{ job.endDate }}
            </div>
            <div class="timeline-card">
              <h3 class="timeline-title">{{ job.role }}</h3>
              <h4 class="timeline-company">
                {{ job.company }}
                <span class="timeline-location">{{ job.location }}</span>
              </h4>
              <p class="timeline-description">
                {{ job.description }}
              </p>
              <div class="timeline-tech">
                <v-chip
                  v-for="tech in job.technologies"
                  :key="tech"
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
        </div>
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

/* Timeline Styles */
.experience-section {
  padding: 120px 0;
  background-color: white;
}

.timeline {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, var(--v-primary-base), #6200ea);
  transform: translateX(-50%);
}

.timeline-item {
  position: relative;
  margin-bottom: 60px;
}

.timeline-dot {
  position: absolute;
  left: 50%;
  top: 10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--v-primary-base), #6200ea);
  transform: translateX(-50%);
  z-index: 1;
  box-shadow: 0 0 0 4px rgba(98, 0, 234, 0.2);
}

.timeline-content {
  position: relative;
  width: 45%;
  margin-left: auto;
}

.timeline-item:nth-child(even) .timeline-content {
  margin-left: 0;
  margin-right: auto;
}

.timeline-date {
  position: absolute;
  top: -18px;
  width: max-content;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--v-primary-base), #6200ea);
  color: #6200ea;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  z-index: 2; /* Add this to ensure date appears above other elements */
}

.timeline-item .timeline-date {
  left: -120px;
  transform: translateY(-50%); /* Add this to vertically center the date */
}

.timeline-item:nth-child(even) .timeline-date {
  right: -120px;
  left: auto;
  transform: translateY(-50%); /* Add this to vertically center the date */
}

.timeline-card {
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin-top: 30px;
}

.timeline-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.timeline-company {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 12px;
}

.timeline-location {
  font-size: 0.9rem;
  color: #888;
  font-style: italic;
}

.timeline-description {
  margin-bottom: 16px;
  line-height: 1.6;
  color: #444;
}

.timeline-tech {
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
  .experience-section {
    padding: 80px 0;
  }

  .section-title {
    font-size: 2rem;
  }

  .timeline::before {
    left: 30px;
  }

  .timeline-dot {
    left: 30px;
  }

  .timeline-content {
    width: calc(100% - 70px);
    margin-left: 70px !important;
  }

  .timeline-item .timeline-date,
  .timeline-item:nth-child(even) .timeline-date {
    left: 70px;
    right: auto;
    top: -15px;
  }
}

@media (max-width: 600px) {
  .experience-section {
    padding: 60px 0;
  }

  .timeline-date {
    position: relative;
    left: 0 !important;
    top: 0 !important;
    right: auto !important;
    display: inline-block;
    margin-bottom: 10px;
  }

  .timeline-card {
    margin-top: 10px;
  }
}
</style>
