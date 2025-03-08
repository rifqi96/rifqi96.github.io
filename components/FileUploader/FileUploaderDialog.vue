<script setup lang="ts">
import { ref } from "vue";
import FileUploader from "./FileUploader.vue";

interface Props {
  modelValue: boolean;
  title?: string;
  accept?: string;
  multiple?: boolean;
  maxFileSize?: number;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Upload File",
  accept: "image/*",
  multiple: false,
  maxFileSize: 5,
  loading: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "upload", files: File[]): void;
  (e: "cancel"): void;
}>();

const uploaderRef = ref<InstanceType<typeof FileUploader> | null>(null);
const error = ref("");

const closeDialog = () => {
  emit("update:modelValue", false);
  resetUploader();
};

const cancelUpload = () => {
  emit("cancel");
  closeDialog();
};

const handleFileUpload = (files: File[]) => {
  emit("upload", files);
  closeDialog();
};

const handleError = (message: string) => {
  error.value = message;
};

const resetUploader = () => {
  error.value = "";
  if (uploaderRef.value) {
    uploaderRef.value.reset();
  }
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600px"
    persistent
    @click:outside="cancelUpload"
  >
    <v-card>
      <v-card-title class="text-h5 pa-4">
        {{ title }}
      </v-card-title>

      <v-card-text class="pa-4">
        <p class="text-body-1 mb-4">
          Add an image to your content. You can upload an image from your device
          or drag and drop it here.
        </p>

        <FileUploader
          ref="uploaderRef"
          :accept="accept"
          :multiple="multiple"
          :max-file-size="maxFileSize"
          :loading="loading"
          :error="error"
          variant="large"
          label="Click or drag images here"
          hint="Supported formats: JPG, PNG, GIF, WEBP (max size: 5MB)"
          @upload="handleFileUpload"
          @error="handleError"
        />
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="cancelUpload"
          :disabled="loading"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="text"
          @click="resetUploader"
          :disabled="loading"
        >
          Reset
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
