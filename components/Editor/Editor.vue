<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import { EditorContent } from "@tiptap/vue-3";
import { mediaService } from "@/domains/console/services/media.service";
import { generateSlug } from "@/utils/input.util";
import type { BlogPost } from "@/types/BlogPost";
import { useEditorConfig } from "./composables/useEditorConfig";
import { useImageUpload } from "./composables/useImageUpload";
import { useEditorEvents } from "./composables/useEditorEvents";
import { useImageIndentation } from "./composables/useImageIndentation";
import { getAllExtensions } from "./extensions";
import FloatingMenu from "./extensions/FloatingMenu.vue";
import ImageFloatingMenu from "./extensions/Image/ImageFloatingMenu.vue";
import ImageUploadDialog from "./components/ImageUploadDialog.vue";

// Import the editor styles is no longer needed here - we'll use a style tag instead

const emit = defineEmits<{ (e: "save", post: Partial<BlogPost>): void }>();

const props = defineProps<{
  initialPost: Partial<BlogPost> | null;
}>();

// Initialize post data
const post = ref<Partial<BlogPost>>({
  title: "",
  description: "",
  content: "",
  content_blocks: [] as any[],
  is_published: false,
  tags: [] as string[],
  media_id: undefined as string | undefined,
  image_url: undefined as string | undefined,
  slug: "",
});

// Populate with existing post data if available
if (props.initialPost) {
  post.value = { ...props.initialPost };
}

// Save content to post and emit save event
const handleContentUpdate = (content: string, contentBlocks: any[]) => {
  post.value.content = content;
  post.value.content_blocks = contentBlocks;
  emit("save", post.value);
};

// Initialize editor with extensions and configuration
const { editor, processEditorContentToBlocks } = useEditorConfig({
  initialContent: props.initialPost?.content || "",
  onUpdate: handleContentUpdate,
  extensions: getAllExtensions(),
});

// References for DOM elements
const editorWrapperRef = ref<HTMLElement | null>(null);

// Image upload functionality
const {
  showImageUploader,
  isUploadingImage,
  handleFileUpload,
  handleDrop,
  uploadAndInsertImage,
} = useImageUpload({
  editor,
  mediaService,
});

// Image indentation functionality
const { setImageIndentation } = useImageIndentation(editor);

// Set up editor event handlers
const eventHandlers = {
  onImageUpload: (file: File) => uploadAndInsertImage(file),
  onImageDialog: () => {
    showImageUploader.value = true;
  },
  onImageIndentation: (indentation: string) =>
    setImageIndentation(indentation as "left" | "center" | "right"),
};

// Set up editor events
useEditorEvents({
  editor,
  editorRef: editorWrapperRef,
  handlers: eventHandlers,
});

// Watch for title changes to update slug
watch(
  () => post.value.title,
  (newTitle) => {
    if (!post.value.slug) {
      post.value.slug = generateSlug(newTitle || "");
    } else if (post.value.slug === generateSlug(post.value.title || "")) {
      post.value.slug = generateSlug(newTitle || "");
    }
  },
);

// Handle title enter key press
const handleTitleEnter = (event: Event) => {
  event.preventDefault();
  emit("save", post.value);
  editor.value?.commands.focus();
};
</script>

<template>
  <div class="editor">
    <div class="metadata">
      <input
        type="text"
        v-model="post.title"
        class="title-input"
        placeholder="Title"
        @keyup.enter="handleTitleEnter"
      />
    </div>
    <div
      ref="editorWrapperRef"
      class="editor-wrapper"
      @drop.prevent="handleDrop"
      @dragover.prevent
    >
      <EditorContent :editor="editor" class="editor-content" />
      <FloatingMenu :editor="editor" v-if="editor" />
      <ImageFloatingMenu :editor="editor" v-if="editor" />
    </div>

    <!-- Image uploader dialog -->
    <ImageUploadDialog
      v-model="showImageUploader"
      title="Upload Image"
      accept="image/*"
      :loading="isUploadingImage"
      @upload="handleFileUpload"
    />
  </div>
</template>

<style lang="scss">
@import "./styles/editor.scss";
</style>
