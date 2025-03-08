<template>
  <div
    v-if="modelValue"
    class="image-upload-dialog-overlay"
    @click.self="cancel"
  >
    <div class="image-upload-dialog">
      <div class="image-upload-dialog-header">
        <h3>{{ title }}</h3>
        <button class="close-button" @click="cancel">×</button>
      </div>
      <div class="image-upload-dialog-body">
        <div
          class="upload-area"
          @click="triggerFileInput"
          @drop.prevent="handleDrop"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          :class="{ dragging: isDragging }"
        >
          <input
            type="file"
            ref="fileInput"
            :accept="accept"
            @change="handleFileChange"
            class="file-input"
            multiple
          />
          <div class="upload-placeholder">
            <div class="upload-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <div class="upload-text">
              <p>Click to upload or drag and drop</p>
              <p class="upload-hint">{{ acceptText }}</p>
            </div>
          </div>
        </div>
        <div v-if="filePreview" class="file-preview">
          <img
            v-if="isImage"
            :src="filePreview"
            alt="Preview"
            class="preview-image"
          />
          <div v-else class="preview-file">
            <div class="file-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                ></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div class="file-name">{{ selectedFile?.name }}</div>
          </div>
        </div>
      </div>
      <div class="image-upload-dialog-footer">
        <button class="cancel-button" @click="cancel" :disabled="loading">
          Cancel
        </button>
        <button
          class="upload-button"
          @click="upload"
          :disabled="!canUpload || loading"
        >
          <span v-if="loading">Uploading...</span>
          <span v-else>Upload</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Upload Image",
  },
  accept: {
    type: String,
    default: "image/*",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "upload"]);

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<File[]>([]);
const selectedFile = computed(() => selectedFiles.value[0] || null);
const filePreview = ref<string | null>(null);
const isDragging = ref(false);

const isImage = computed(() => {
  return selectedFile.value && selectedFile.value.type.startsWith("image/");
});

const acceptText = computed(() => {
  if (props.accept === "image/*") {
    return "Supports JPG, PNG, GIF";
  }
  return `Accepts ${props.accept}`;
});

const canUpload = computed(() => {
  return selectedFiles.value.length > 0;
});

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFiles.value = Array.from(target.files);
    generatePreview();
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    selectedFiles.value = Array.from(event.dataTransfer.files);
    generatePreview();
  }
}

function handleDragOver(event: DragEvent) {
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}

function generatePreview() {
  if (!selectedFile.value) {
    filePreview.value = null;
    return;
  }

  if (isImage.value) {
    const reader = new FileReader();
    reader.onload = (e) => {
      filePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile.value);
  } else {
    filePreview.value = null;
  }
}

function upload() {
  emit("upload", selectedFiles.value);
  // Reset state after upload
  selectedFiles.value = [];
  filePreview.value = null;
}

function cancel() {
  emit("update:modelValue", false);
  // Reset state
  selectedFiles.value = [];
  filePreview.value = null;
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      // Reset when dialog is closed
      selectedFiles.value = [];
      filePreview.value = null;
    }
  },
);
</script>

<style lang="scss" scoped>
.image-upload-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.image-upload-dialog {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  animation: dialog-fade-in 0.2s ease-out;
}

@keyframes dialog-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.image-upload-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.image-upload-dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #888;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-button:hover {
  color: #333;
  background-color: #f5f5f5;
}

.image-upload-dialog-body {
  padding: 20px;
}

.upload-area {
  position: relative;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover,
  &.dragging {
    border-color: #2563eb;
    background-color: rgba(37, 99, 235, 0.05);
  }
}

.file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  color: #888;
  margin-bottom: 12px;
}

.upload-text {
  color: #555;

  p {
    margin: 0 0 4px;
  }

  .upload-hint {
    font-size: 14px;
    color: #888;
  }
}

.file-preview {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-file {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.file-icon {
  margin-right: 12px;
  color: #555;
}

.file-name {
  font-size: 14px;
  color: #333;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-upload-dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #eee;
  gap: 12px;
}

.cancel-button {
  background-color: transparent;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  color: #555;

  &:hover:not(:disabled) {
    background-color: #f5f5f5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.upload-button {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;

  &:hover:not(:disabled) {
    background-color: #1d4ed8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
