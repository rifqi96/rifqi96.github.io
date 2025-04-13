<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import { EditorContent } from "@tiptap/vue-3";
import { mediaService } from "@/domains/console/services/media.service";
import { generateSlug } from "@/utils/input.util";
import type { BlogPost } from "@/types/BlogPost";
import type { Media } from "@/types/Media";
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

// Initialize with existing featured image if available
const featuredImageMedia = ref<Media | null>(null);

// Populate with existing post data if available
if (props.initialPost) {
  post.value = { ...props.initialPost };
  if (props.initialPost.media) {
    featuredImageMedia.value = props.initialPost.media;
  }
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

// New method to handle featured image event
const handleFeaturedImageEvent = () => {
  const hasFeaturedImage =
    editor.value?.state.doc.firstChild?.type.name === "featuredImage";

  if (!hasFeaturedImage) {
    // If no featured image exists, create one
    editor.value?.commands.setFeaturedImage({});
  } else {
    // If it exists, we can trigger the dialog or edit via DOM
    const featuredImageNode = document.querySelector(
      ".featured-image-node .image-overlay .v-btn:first-child",
    );
    if (featuredImageNode) {
      (featuredImageNode as HTMLElement).click();
    }
  }
};

// Set up editor event handlers
const eventHandlers = {
  onImageUpload: (file: File) => uploadAndInsertImage(file),
  onImageDialog: () => {
    showImageUploader.value = true;
  },
  onImageIndentation: (indentation: string) =>
    setImageIndentation(indentation as "left" | "center" | "right"),
  onFeaturedImage: handleFeaturedImageEvent,
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

// Create a function reference for the event listener to properly remove it later
const handleFeaturedImageChange = (event: Event) => {
  const customEvent = event as CustomEvent;
  const { mediaId, imageUrl, media } = customEvent.detail;

  // Update the post data with the new featured image information
  post.value.media_id = mediaId;
  post.value.image_url = imageUrl;
  featuredImageMedia.value = media;

  // Emit the save event with the updated post data
  emit("save", post.value);
};

// Setup featured image handling
onMounted(() => {
  // Initialize featured image if one exists in the initial post
  if (props.initialPost?.media_id || props.initialPost?.image_url) {
    setTimeout(() => {
      if (editor.value) {
        editor.value.commands.setFeaturedImage({
          mediaId: props.initialPost?.media_id,
          imageUrl: props.initialPost?.image_url,
          media: props.initialPost?.media || null,
        });
      }
    }, 100);
  }

  // Add the event listener
  if (editorWrapperRef.value) {
    editorWrapperRef.value.addEventListener(
      "featured-image-changed",
      handleFeaturedImageChange,
    );
  }
});

// Clean up event listeners
onBeforeUnmount(() => {
  if (editorWrapperRef.value) {
    editorWrapperRef.value.removeEventListener(
      "featured-image-changed",
      handleFeaturedImageChange,
    );
  }
});
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
