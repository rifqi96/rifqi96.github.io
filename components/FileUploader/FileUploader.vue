<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  accept?: string;
  multiple?: boolean;
  variant?: "normal" | "compact" | "large";
  maxFileSize?: number; // in MB
  loading?: boolean;
  error?: string;
  label?: string;
  hint?: string;
}

const props = withDefaults(defineProps<Props>(), {
  accept: "image/*",
  multiple: false,
  variant: "normal",
  maxFileSize: 5, // 5MB default
  loading: false,
  error: "",
  label: "Upload File",
  hint: "",
});

const emit = defineEmits<{
  (e: "upload", files: File[]): void;
  (e: "error", message: string): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const dragCounter = ref(0);
const hoveredFiles = ref<string[]>([]);

const isCompact = computed(() => props.variant === "compact");
const isLarge = computed(() => props.variant === "large");

// Styling for variants
const uploaderClasses = computed(() => ({
  "file-uploader": true,
  "file-uploader--compact": isCompact.value,
  "file-uploader--large": isLarge.value,
  "file-uploader--dragging": isDragging.value,
  "file-uploader--error": !!props.error,
  "file-uploader--loading": props.loading,
}));

// Open file dialog
const openFileDialog = () => {
  if (!props.loading && fileInput.value) {
    fileInput.value.click();
  }
};

// Handle file selection from input
const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const filesArray = Array.from(input.files);
    validateAndEmitFiles(filesArray);

    // Reset the input so the same file can be selected again
    input.value = "";
  }
};

// Handle drag events
const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  dragCounter.value++;
  isDragging.value = true;

  // Preview file names if possible
  if (event.dataTransfer?.items) {
    hoveredFiles.value = [];
    for (let i = 0; i < event.dataTransfer.items.length; i++) {
      const item = event.dataTransfer.items[i];
      if (item.kind === "file") {
        // We can't get the name directly from dataTransfer.items,
        // but we can set a placeholder
        hoveredFiles.value.push("File " + (i + 1));
      }
    }
  }
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  dragCounter.value--;
  if (dragCounter.value === 0) {
    isDragging.value = false;
    hoveredFiles.value = [];
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
  dragCounter.value = 0;
  hoveredFiles.value = [];

  if (!event.dataTransfer?.files.length) return;

  const filesArray = Array.from(event.dataTransfer.files);
  validateAndEmitFiles(filesArray);
};

// Validate and emit files
const validateAndEmitFiles = (files: File[]) => {
  // Filter by accepted types if specified
  const validTypeFiles = props.accept
    ? files.filter((file) => {
        const fileType = file.type;
        // Handle wildcards like "image/*"
        if (props.accept.includes("/*")) {
          const mainType = props.accept.split("/")[0];
          return fileType.startsWith(`${mainType}/`);
        }
        // Handle specific types or comma-separated list
        return props.accept.split(",").some((type) => fileType === type.trim());
      })
    : files;

  if (validTypeFiles.length < files.length) {
    emit(
      "error",
      `Some files were rejected. Accepted formats: ${props.accept}`,
    );
    if (validTypeFiles.length === 0) return;
  }

  // Check file size
  const validSizeFiles = validTypeFiles.filter(
    (file) => file.size <= props.maxFileSize * 1024 * 1024,
  );

  if (validSizeFiles.length < validTypeFiles.length) {
    emit(
      "error",
      `Some files exceed the maximum size of ${props.maxFileSize}MB`,
    );
    if (validSizeFiles.length === 0) return;
  }

  // Emit final valid files
  emit("upload", props.multiple ? validSizeFiles : [validSizeFiles[0]]);
};

// Reset the uploader
const reset = () => {
  if (fileInput.value) {
    fileInput.value.value = "";
  }
  isDragging.value = false;
  dragCounter.value = 0;
  hoveredFiles.value = [];
};

// Expose reset method to parent components
defineExpose({
  reset,
});
</script>

<template>
  <div
    :class="uploaderClasses"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @click="openFileDialog"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="file-uploader__input"
      @change="handleFileInputChange"
    />

    <div class="file-uploader__content">
      <v-icon
        :size="isCompact ? 'small' : isLarge ? 'x-large' : 'large'"
        class="file-uploader__icon"
        :class="{ 'mb-2': !isCompact }"
      >
        {{
          isDragging ? "mdi-file-upload-outline" : "mdi-cloud-upload-outline"
        }}
      </v-icon>

      <div v-if="!isCompact" class="file-uploader__text">
        <span class="file-uploader__title">
          {{ isDragging ? "Drop files here" : label }}
        </span>

        <span v-if="hint && !isDragging" class="file-uploader__hint">
          {{ hint }}
        </span>

        <div
          v-if="isDragging && hoveredFiles.length"
          class="file-uploader__preview"
        >
          <span v-for="(file, index) in hoveredFiles" :key="index">
            {{ file }}
          </span>
        </div>
      </div>

      <v-progress-circular
        v-if="loading"
        indeterminate
        color="primary"
        :size="isCompact ? 20 : 30"
        class="file-uploader__loader"
      ></v-progress-circular>
    </div>

    <div v-if="error" class="file-uploader__error">
      {{ error }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.file-uploader {
  position: relative;
  border: 2px dashed rgba(var(--v-theme-primary), 0.5);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background-color: rgba(var(--v-theme-primary), 0.05);
  text-align: center;

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.8);
    background-color: rgba(var(--v-theme-primary), 0.08);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }

  &--compact {
    padding: 8px 12px;
    flex-direction: row;
    justify-content: flex-start;

    .file-uploader__icon {
      margin-right: 8px;
    }
  }

  &--large {
    padding: 40px;

    .file-uploader__title {
      font-size: 1.5rem;
      margin-bottom: 8px;
    }
  }

  &--dragging {
    border-color: rgba(var(--v-theme-primary), 1);
    background-color: rgba(var(--v-theme-primary), 0.12);
    transform: scale(1.02);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);

    .file-uploader__icon {
      animation: bounce 1s infinite alternate;
      color: rgb(var(--v-theme-primary));
    }
  }

  &--error {
    border-color: rgba(var(--v-theme-error), 0.7);
    background-color: rgba(var(--v-theme-error), 0.05);
  }

  &--loading {
    pointer-events: none;
    opacity: 0.8;
  }

  &__input {
    display: none;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  &__icon {
    color: rgba(var(--v-theme-primary), 0.9);
    transition: all 0.3s;
  }

  &__text {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  &__title {
    font-weight: 500;
    color: rgba(var(--v-theme-on-surface), 0.9);
  }

  &__hint {
    font-size: 0.85rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin-top: 4px;
  }

  &__preview {
    margin-top: 12px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.9rem;
    color: rgba(var(--v-theme-on-surface), 0.7);

    span {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &__error {
    color: rgb(var(--v-theme-error));
    font-size: 0.85rem;
    margin-top: 8px;
    width: 100%;
  }
}

@keyframes bounce {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-5px);
  }
}
</style>
