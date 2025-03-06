<script setup lang="ts">
import { useWorkExperience } from "@/domains/home/composables/useWorkExperience";
import { mediaService } from "@/domains/console/services/media.service";
import type { Media } from "@/types/Media";
import type { WorkExperience } from "@/types/WorkExperience";

const { workExperience, status } = useWorkExperience();
const config = useRuntimeConfig();

const isLoading = computed(
  () => status.value === "pending" || status.value === "idle",
);

const getLogoUrl = (job: WorkExperience) => {
  // Handle media being an array
  const mediaItem = Array.isArray(job.media) ? job.media[0] : job.media;

  if (mediaItem && isValidMedia(mediaItem)) {
    return mediaService.getPublicUrl(mediaItem);
  }
  return job.company_logo_url || null;
};

const isValidMedia = (media: Media | null) => {
  if (!media) return false;
  return (
    media.id &&
    media.bucket_name &&
    media.storage_path &&
    media.file_name &&
    media.mime_type &&
    typeof media.size_bytes === "number"
  );
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return "Present";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};
</script>

<template>
  <section class="experience-section">
    <v-container class="px-4">
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
          :class="{ 'timeline-item-even': index % 2 === 1 }"
        >
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-date">
              {{ formatDate(job.start_date) }} - {{ formatDate(job.end_date) }}
            </div>
            <div class="timeline-card elevation-1">
              <div class="d-flex">
                <div class="company-logo mr-4">
                  <v-img
                    v-if="getLogoUrl(job)"
                    :src="getLogoUrl(job) as string"
                    :alt="`${job.company} logo`"
                    width="48"
                    height="48"
                    cover
                    class="rounded"
                  />
                  <div v-else class="company-logo-placeholder">
                    {{ job.company.charAt(0) }}
                  </div>
                </div>
                <div class="flex-grow-1">
                  <h3 class="timeline-title">{{ job.position }}</h3>
                  <h4 class="timeline-company">
                    <a
                      v-if="job.company_url"
                      :href="job.company_url"
                      target="_blank"
                      class="company-link"
                    >
                      {{ job.company }}
                    </a>
                    <span v-else>{{ job.company }}</span>
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
  background: linear-gradient(
    135deg,
    var(--v-primary-base),
    rgb(var(--v-theme-primary))
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: rgb(var(--v-theme-primary));
}

.section-divider {
  width: 80px;
  height: 4px;
  background: linear-gradient(
    to right,
    var(--v-primary-base),
    rgb(var(--v-theme-primary))
  );
  margin: 0 auto 16px;
  border-radius: 4px;
}

.section-description {
  font-size: 1.1rem;
  color: rgb(var(--v-theme-text-muted));
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
  top: 14px;
  bottom: 0;
  width: 2px;
  background-color: rgba(var(--v-theme-on-surface), 0.12);
  transform: translateX(-50%);
}

.timeline-item {
  position: relative;
  margin-bottom: 48px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
}

.timeline-item:nth-child(2) {
  animation-delay: 0.2s;
}
.timeline-item:nth-child(3) {
  animation-delay: 0.4s;
}
.timeline-item:nth-child(4) {
  animation-delay: 0.6s;
}
.timeline-item:nth-child(5) {
  animation-delay: 0.8s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.timeline-item::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 14px;
  width: calc(50% - 20px);
  height: 2px;
  background-color: rgba(var(--v-theme-on-surface), 0.12);
}

.timeline-item-even::after {
  left: auto;
  right: 50%;
}

.timeline-dot {
  position: absolute;
  left: 50%;
  top: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgb(var(--v-theme-primary));
  border: 2px solid rgb(var(--v-theme-surface));
  transform: translateX(-50%) scale(1);
  z-index: 2;
  transition: transform 0.2s ease;
}

.timeline-item:hover .timeline-dot {
  transform: translateX(-50%) scale(1.5);
}

.company-logo {
  flex-shrink: 0;
}

.company-logo-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  background-color: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
}

.timeline-content {
  position: relative;
  width: calc(50% - 32px);
  margin-left: auto;
}

.timeline-item-even .timeline-content {
  margin-left: 0;
  margin-right: auto;
}

.timeline-date {
  margin-bottom: 12px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 0.875rem;
  font-weight: 400;
}

.timeline-card {
  padding: 24px;
  background: rgb(var(--v-theme-surface));
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  transition: all 0.2s ease;
  transform: translateY(0);
}

.timeline-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.timeline-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.4;
}

.timeline-company {
  font-size: 1rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-bottom: 8px;
  line-height: 1.4;
}

.company-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.company-link:hover {
  color: rgb(var(--v-theme-primary));
}

.timeline-location {
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.timeline-description {
  margin-bottom: 12px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  line-height: 1.5;
  font-size: 0.9375rem;
}

.timeline-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
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
@media (max-width: 959px) {
  .experience-section {
    padding: 80px 0;
  }

  .section-title {
    font-size: 2rem;
  }

  .timeline::before {
    left: 28px;
    top: 14px;
  }

  .timeline-dot {
    left: 28px;
  }

  .timeline-item::after {
    display: none;
  }

  .timeline-content {
    width: calc(100% - 56px);
    margin-left: 56px !important;
  }

  .timeline-date {
    margin-bottom: 8px;
  }

  .timeline-item {
    margin-bottom: 32px;
  }
}

@media (max-width: 599px) {
  .experience-section {
    padding: 60px 0;
  }

  .timeline::before {
    left: 24px;
  }

  .timeline-dot {
    left: 24px;
  }

  .timeline-content {
    width: calc(100% - 48px);
    margin-left: 48px !important;
  }

  .timeline-card {
    padding: 16px;
  }

  .company-logo {
    margin-right: 12px !important;
  }

  .company-logo-placeholder,
  .v-img {
    width: 40px !important;
    height: 40px !important;
  }

  .company-logo-placeholder {
    font-size: 16px !important;
  }

  .timeline-title {
    font-size: 1rem;
  }

  .timeline-company,
  .timeline-description {
    font-size: 0.875rem;
  }

  .timeline-item {
    margin-bottom: 24px;
  }
}
</style>
