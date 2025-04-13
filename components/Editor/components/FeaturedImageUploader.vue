<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { mediaService } from "@/domains/console/services/media.service";
import type { Media } from "@/types/Media";

const props = defineProps<{
  mediaId?: string;
  imageUrl?: string;
  media?: Media | null;
}>();

const emit = defineEmits<{
  (e: "update:mediaId", value: string | undefined): void;
  (e: "update:imageUrl", value: string | undefined): void;
  (e: "update:media", value: Media | null): void;
}>();

const currentMedia = ref<Media | null>(props.media || null);
const mediaId = ref<string | undefined>(props.mediaId);
const imageUrl = ref<string | undefined>(props.imageUrl);
const isUploading = ref(false);
const error = ref<string | null>(null);
const showUploadDialog = ref(false);
const tab = ref("upload");
const urlInput = ref("");

// Watch for prop changes
watch(
  () => props.mediaId,
  (newVal) => {
    mediaId.value = newVal;
  },
  { immediate: true },
);

watch(
  () => props.imageUrl,
  (newVal) => {
    imageUrl.value = newVal;
  },
  { immediate: true },
);

watch(
  () => props.media,
  (newVal) => {
    currentMedia.value = newVal || null;
  },
  { immediate: true },
);

// Computed for the preview image
const previewImageUrl = computed(() => {
  if (currentMedia.value) {
    return mediaService.getPublicUrl(currentMedia.value);
  }
  return imageUrl.value || "";
});

// Handle file upload
async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  try {
    isUploading.value = true;
    error.value = null;

    // If there's an existing media, clear it first
    if (mediaId.value) {
      await clearMedia();
    }

    // Upload the new image
    const media = await mediaService.upload({
      file: input.files[0],
      folder: "blog",
    });

    // Update local refs and emit events
    currentMedia.value = media;
    mediaId.value = media.id;
    imageUrl.value = undefined; // Clear URL when file is selected

    emit("update:mediaId", media.id);
    emit("update:imageUrl", undefined);
    emit("update:media", media);
  } catch (err: any) {
    console.error("Failed to upload image:", err);
    error.value = err.message || "Failed to upload image";
  } finally {
    isUploading.value = false;
    showUploadDialog.value = false;
  }
}

// Set image from URL
function setImageUrl(url: string) {
  if (!url) return;

  // Clear existing media if any
  if (mediaId.value) {
    clearMedia();
  }

  imageUrl.value = url;
  emit("update:imageUrl", url);
  emit("update:mediaId", undefined);
  emit("update:media", null);
}

// Clear the media
async function clearMedia() {
  try {
    isUploading.value = true;
    error.value = null;

    // If we have a media ID and it was uploaded in this session, delete it
    if (mediaId.value && currentMedia.value) {
      await mediaService.delete(mediaId.value);
    }

    // Clear all values
    currentMedia.value = null;
    mediaId.value = undefined;
    imageUrl.value = undefined;

    // Emit events
    emit("update:mediaId", undefined);
    emit("update:imageUrl", undefined);
    emit("update:media", null);
  } catch (err: any) {
    console.error("Failed to clear image:", err);
    error.value = err.message || "Failed to clear image";
  } finally {
    isUploading.value = false;
  }
}
</script>

<template>
  <div class="featured-image-uploader">
    <!-- Image Preview Area -->
    <div
      v-if="previewImageUrl"
      class="image-preview"
      :class="{ 'with-image': previewImageUrl }"
    >
      <v-img :src="previewImageUrl" height="250" cover class="rounded">
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular indeterminate></v-progress-circular>
          </div>
        </template>
      </v-img>

      <div class="image-overlay">
        <v-btn
          icon="mdi-pencil"
          size="small"
          color="white"
          variant="text"
          @click="showUploadDialog = true"
          class="mx-1"
        ></v-btn>
        <v-btn
          icon="mdi-close"
          size="small"
          color="white"
          variant="text"
          @click="clearMedia"
          class="mx-1"
        ></v-btn>
      </div>
    </div>

    <!-- Upload Prompt Area -->
    <div v-else class="upload-prompt" @click="showUploadDialog = true">
      <div class="upload-content">
        <v-icon icon="mdi-image-plus" size="large" class="mb-2"></v-icon>
        <p>Add a featured image</p>
      </div>
    </div>

    <!-- Upload Dialog -->
    <v-dialog v-model="showUploadDialog" max-width="500">
      <v-card>
        <v-card-title>Featured Image</v-card-title>
        <v-card-text>
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

          <v-tabs v-model="tab">
            <v-tab value="upload">Upload</v-tab>
            <v-tab value="url">URL</v-tab>
          </v-tabs>

          <v-window v-model="tab" class="mt-4">
            <v-window-item value="upload">
              <v-file-input
                label="Select Image"
                accept="image/*"
                :loading="isUploading"
                @change="handleFileUpload"
                variant="outlined"
                prepend-icon="mdi-camera"
                hide-details
              ></v-file-input>
            </v-window-item>

            <v-window-item value="url">
              <v-form @submit.prevent="setImageUrl(urlInput)">
                <v-text-field
                  v-model="urlInput"
                  label="Image URL"
                  variant="outlined"
                  hide-details
                  class="mb-4"
                ></v-text-field>
                <v-btn color="primary" type="submit" :disabled="!urlInput">
                  Set Image
                </v-btn>
              </v-form>
            </v-window-item>
          </v-window>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showUploadDialog = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
.featured-image-uploader {
  width: 100%;
  margin-bottom: 20px;

  .image-preview {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover .image-overlay {
      opacity: 1;
    }

    &.with-image {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .image-overlay {
    position: absolute;
    top: 0;
    right: 0;
    padding: 8px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 0 0 0 8px;
    display: flex;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .upload-prompt {
    border: 2px dashed rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: rgba(0, 0, 0, 0.02);

    &:hover {
      border-color: rgba(0, 0, 0, 0.4);
      background: rgba(0, 0, 0, 0.05);
    }

    .upload-content {
      text-align: center;
      color: rgba(0, 0, 0, 0.6);

      p {
        margin: 0;
        font-size: 1rem;
      }
    }
  }
}
</style>
