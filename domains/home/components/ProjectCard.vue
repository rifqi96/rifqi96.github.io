<script setup lang="ts">
import { handleLinkNavigation } from "@/utils/navigation";

interface Props {
  project: {
    title: string;
    description: string;
    technologies: string[];
    image: string;
    link?: string;
    isAvailable?: boolean;
  };
}

const props = defineProps<Props>();
const router = useRouter();
</script>

<template>
  <div class="project-card">
    <div class="project-image">
      <v-img :src="project.image" height="200" cover class="rounded-lg"></v-img>
      <div class="project-overlay">
        <v-btn
          v-if="project.link && project.isAvailable !== false"
          :href="project.link"
          @click="(e: Event) => handleLinkNavigation(project.link!, e, router)"
          color="primary"
          variant="elevated"
        >
          View Project
        </v-btn>
        <v-btn v-else disabled color="primary" variant="elevated">
          Coming Soon
        </v-btn>
      </div>
    </div>
    <div class="project-content">
      <h3 class="project-title">{{ project.title }}</h3>
      <p class="project-description">{{ project.description }}</p>
      <div class="project-tags">
        <v-chip
          v-for="tech in project.technologies"
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
</template>

<style scoped>
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
</style>
@/utils/navigation.util
