<script setup lang="ts">
import { ref } from "vue";
import { projectService } from "@/domains/console/services/project.service";
import type { Project } from "@/types/Project";
import { mediaService } from "@/domains/console/services/media.service";
import type { Media } from "@/types/Media";

// Page metadata
definePageMeta({
  layout: "console",
  middleware: ["auth"],
  meta: {
    requireRole: "superadmin",
  },
});

useHead({
  title: "Edit Project",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const route = useRoute();
const router = useRouter();

// Form state
const form = ref<Partial<Project>>({
  id: undefined,
  title: "",
  description: "",
  technologies: [],
  link: "",
  repo_url: "",
  is_available: true,
  is_featured: false,
  is_coming_soon: false,
  is_published: false,
  media_id: undefined,
  image_url: undefined,
});

const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const mediaFile = ref<File | null>(null);
const currentMedia = ref<Media | null>(null);
const uploadingMedia = ref(false);

// Load project data
async function loadProject() {
  loading.value = true;
  error.value = null;

  try {
    const data = await projectService.getProject(route.params.id as string);

    // Populate form fields
    form.value = {
      ...data,
      technologies: data.technologies || [],
      link: data.link || "",
      repo_url: data.repo_url || "",
      is_available: data.is_available ?? true,
      is_featured: data.is_featured ?? false,
      is_coming_soon: data.is_coming_soon ?? false,
      is_published: data.is_published ?? true,
    };

    currentMedia.value = data.media || null;
  } catch (err) {
    console.error("Error loading project:", err);
    error.value = "Failed to load project";
  } finally {
    loading.value = false;
  }
}

// Handle media upload
async function handleMediaUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  try {
    uploadingMedia.value = true;
    mediaFile.value = input.files[0];
    form.value.image_url = undefined; // Clear URL when file is selected

    const media = await mediaService.upload({
      file: input.files[0],
      folder: "projects",
    });
    currentMedia.value = media;
    form.value.media_id = media.id;
  } catch (err) {
    console.error("Error uploading media:", err);
    error.value = "Failed to upload media";
  } finally {
    uploadingMedia.value = false;
  }
}

// Clear media
async function clearMedia() {
  try {
    uploadingMedia.value = true;

    // If we have a media ID, delete it first
    if (form.value.media_id) {
      await mediaService.delete(form.value.media_id);
    }

    // Clear local state
    mediaFile.value = null;
    form.value.image_url = undefined;
    form.value.media_id = undefined;
    currentMedia.value = null;
  } catch (err) {
    console.error("Error clearing media:", err);
    error.value = "Failed to clear media";
  } finally {
    uploadingMedia.value = false;
  }
}

// Save project
async function handleSubmit() {
  if (!form.value.id) return;

  saving.value = true;
  error.value = null;

  try {
    // Update project
    await projectService.updateProject(form.value.id, {
      title: form.value.title,
      description: form.value.description,
      technologies: form.value.technologies,
      link: form.value.link || undefined,
      repo_url: form.value.repo_url || undefined,
      is_available: form.value.is_available,
      is_featured: form.value.is_featured,
      is_coming_soon: form.value.is_coming_soon,
      is_published: form.value.is_published,
      media_id: form.value.media_id,
      image_url: form.value.image_url,
    });

    // Redirect to projects list
    router.push({ name: "console-projects" });
  } catch (err) {
    console.error("Error saving project:", err);
    error.value = "Failed to save project";
  } finally {
    saving.value = false;
  }
}

// Load initial data
onMounted(() => {
  loadProject();
});
</script>

<template>
  <div class="project-edit">
    <v-container>
      <div class="d-flex align-center mb-6">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          :to="{
            name: 'console-projects',
          }"
          class="mr-4"
        ></v-btn>
        <h1 class="text-h4">Edit Project</h1>
      </div>

      <!-- Error Alert -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="error = null"
      >
        {{ error }}
      </v-alert>

      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </div>

      <!-- Edit Form -->
      <v-form v-else @submit.prevent="handleSubmit">
        <v-card>
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.title"
                  label="Title"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  label="Description"
                  required
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-combobox
                  v-model="form.technologies"
                  label="Technologies"
                  multiple
                  chips
                  required
                ></v-combobox>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="form.link"
                  label="Project Link"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="form.repo_url"
                  label="Repository URL"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="form.is_available"
                  label="Project Available"
                  color="primary"
                  hide-details
                ></v-switch>
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="form.is_featured"
                  label="Featured Project"
                  color="primary"
                  hide-details
                ></v-switch>
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="form.is_coming_soon"
                  label="Coming Soon"
                  color="primary"
                  hide-details
                ></v-switch>
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="form.is_published"
                  label="Published"
                  color="primary"
                  hide-details
                ></v-switch>
              </v-col>

              <v-col cols="12">
                <p class="text-subtitle-1 mb-2">Project Image</p>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.image_url"
                  label="Image URL"
                  hint="Optional - Enter URL or upload file below"
                  persistent-hint
                  :disabled="!!mediaFile || !!currentMedia"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-file-input
                  v-model="mediaFile"
                  label="Upload Image"
                  accept="image/*"
                  :loading="uploadingMedia"
                  :disabled="!!form.image_url || uploadingMedia"
                  @change="handleMediaUpload"
                  hint="Optional - Upload image or enter URL above"
                  persistent-hint
                />
              </v-col>

              <v-col cols="12" md="6" v-if="currentMedia || form.image_url">
                <div class="d-flex align-center">
                  <v-img
                    :src="
                      currentMedia
                        ? mediaService.getPublicUrl(currentMedia)
                        : form.image_url
                    "
                    max-width="100"
                    max-height="100"
                    contain
                    class="mr-4"
                  />
                  <v-btn
                    color="error"
                    variant="text"
                    :loading="uploadingMedia"
                    :disabled="uploadingMedia"
                    @click="clearMedia"
                    icon="mdi-close"
                  />
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="primary" type="submit" :loading="saving"
              >Save Project</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-form>
    </v-container>
  </div>
</template>
