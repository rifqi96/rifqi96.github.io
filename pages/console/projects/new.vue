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
  title: "Add Project",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const router = useRouter();

// Form state
const form = ref<Partial<Project>>({
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

const saving = ref(false);
const error = ref<string | null>(null);
const mediaFile = ref<File | null>(null);
const mediaPreview = ref<Media | null>(null);
const uploadingMedia = ref(false);

// Handle media file selection
async function handleMediaUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  try {
    uploadingMedia.value = true;
    mediaFile.value = input.files[0];
    form.value.image_url = undefined; // Clear URL when file is selected

    // Upload immediately
    const media = await mediaService.upload({
      file: mediaFile.value,
      folder: "projects",
    });
    mediaPreview.value = media;
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
    mediaPreview.value = null;
  } catch (err) {
    console.error("Error clearing media:", err);
    error.value = "Failed to clear media";
  } finally {
    uploadingMedia.value = false;
  }
}

// Save project
async function handleSubmit() {
  saving.value = true;
  error.value = null;

  try {
    // Create project
    await projectService.createProject({
      ...form.value,
      link: form.value.link || undefined,
    } as Project);

    // Redirect to projects list
    router.push({ name: "console-projects" });
  } catch (err) {
    console.error("Error creating project:", err);
    error.value = "Failed to create project";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="project-new">
    <v-container>
      <div class="d-flex align-center mb-6">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          :to="{ name: 'console-projects' }"
          class="mr-4"
        ></v-btn>
        <h1 class="text-h4">Add Project</h1>
      </div>

      <v-form @submit.prevent="handleSubmit">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.title"
                  label="Title"
                  required
                  :disabled="saving"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  label="Description"
                  required
                  :disabled="saving"
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-combobox
                  v-model="form.technologies"
                  label="Technologies"
                  multiple
                  chips
                  :disabled="saving"
                ></v-combobox>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="form.link"
                  label="Link"
                  :disabled="saving"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="form.repo_url"
                  label="Repository URL"
                  :disabled="saving"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.image_url"
                  label="Image URL"
                  hint="Optional - Enter URL or upload file below"
                  persistent-hint
                  :disabled="!!mediaFile || !!mediaPreview"
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

              <v-col cols="12" md="6" v-if="mediaPreview || form.image_url">
                <div class="d-flex align-center">
                  <v-img
                    :src="
                      mediaPreview
                        ? mediaService.getPublicUrl(mediaPreview)
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

              <v-col cols="12">
                <v-switch
                  v-model="form.is_published"
                  label="Published"
                  color="primary"
                  :disabled="saving"
                ></v-switch>

                <v-switch
                  v-model="form.is_available"
                  label="Available"
                  color="primary"
                  :disabled="saving"
                ></v-switch>

                <v-switch
                  v-model="form.is_featured"
                  label="Featured"
                  color="primary"
                  :disabled="saving"
                ></v-switch>

                <v-switch
                  v-model="form.is_coming_soon"
                  label="Coming Soon"
                  color="primary"
                  :disabled="saving"
                ></v-switch>
              </v-col>
            </v-row>

            <v-alert v-if="error" type="error" variant="tonal" class="mt-4">
              {{ error }}
            </v-alert>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :to="{ name: 'console-projects' }"
              variant="text"
              :disabled="saving"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              type="submit"
              :loading="saving"
              :disabled="saving"
              >Save</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-form>
    </v-container>
  </div>
</template>
