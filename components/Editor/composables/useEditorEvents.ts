import { onMounted, onBeforeUnmount } from "vue";

export function useEditorEvents(options: {
  editor: any;
  editorRef: any;
  handlers?: {
    onImageUpload?: (file: File) => void;
    onImageDialog?: () => void;
    onImageIndentation?: (indentation: string) => void;
    onFeaturedImage?: () => void;
  };
}) {
  const { editor, editorRef, handlers = {} } = options;

  // Event handler for image upload
  const handleImageUpload = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (
      customEvent.detail &&
      customEvent.detail.file &&
      handlers.onImageUpload
    ) {
      handlers.onImageUpload(customEvent.detail.file);
    }
  };

  // Event handler for image dialog
  const handleImageDialog = () => {
    if (handlers.onImageDialog) {
      handlers.onImageDialog();
    }
  };

  // Event handler for featured image
  const handleFeaturedImage = () => {
    if (handlers.onFeaturedImage) {
      handlers.onFeaturedImage();
    }
  };

  // Event handler for image indentation
  const handleImageIndentation = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (
      customEvent.detail &&
      customEvent.detail.indentation &&
      handlers.onImageIndentation
    ) {
      handlers.onImageIndentation(customEvent.detail.indentation);
    }
  };

  // Function to set up event listeners
  const setupEventListeners = () => {
    const editorWrapper = editorRef.value;

    if (!editorWrapper) return;

    // Add event listeners
    editorWrapper.addEventListener("tiptap-image-upload", handleImageUpload);
    editorWrapper.addEventListener("tiptap-image-dialog", handleImageDialog);
    editorWrapper.addEventListener(
      "tiptap-featured-image",
      handleFeaturedImage,
    );
    editorWrapper.addEventListener(
      "tiptap-set-image-indentation",
      handleImageIndentation,
    );
  };

  // Function to clean up event listeners
  const cleanupEventListeners = () => {
    const editorWrapper = editorRef.value;

    if (!editorWrapper) return;

    // Remove event listeners
    editorWrapper.removeEventListener("tiptap-image-upload", handleImageUpload);
    editorWrapper.removeEventListener("tiptap-image-dialog", handleImageDialog);
    editorWrapper.removeEventListener(
      "tiptap-featured-image",
      handleFeaturedImage,
    );
    editorWrapper.removeEventListener(
      "tiptap-set-image-indentation",
      handleImageIndentation,
    );
  };

  // Set up event listeners on mount and clean up on unmount
  onMounted(() => {
    setupEventListeners();
  });

  onBeforeUnmount(() => {
    cleanupEventListeners();
  });

  return {
    setupEventListeners,
    cleanupEventListeners,
  };
}
