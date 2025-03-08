import { ref } from "vue";

export function useImageUpload(options: { editor: any; mediaService?: any }) {
  const { editor, mediaService } = options;
  const showImageUploader = ref(false);
  const isUploadingImage = ref(false);

  // Handle file upload from a dialog
  async function handleFileUpload(files: File[]) {
    if (files.length === 0 || !editor.value) return;

    try {
      isUploadingImage.value = true;
      await uploadAndInsertImage(files[0]);
    } catch (error) {
      console.error("Media upload failed:", error);
    } finally {
      isUploadingImage.value = false;
    }
  }

  // Handle drag and drop on editor
  async function handleDrop(event: DragEvent) {
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      // Filter for image files only
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (imageFiles.length > 0) {
        // Prevent default to stop editor's built-in handling of files
        event.preventDefault();
        await uploadAndInsertImage(imageFiles[0]);
      }
    }
  }

  async function uploadAndInsertImage(file: File) {
    if (!mediaService) {
      // Fallback to URL if no media service provided
      const url = URL.createObjectURL(file);
      if (editor.value) {
        editor.value.chain().focus().setImage({ src: url }).run();
      }
      return { id: null, url };
    }

    try {
      isUploadingImage.value = true;
      const media = await mediaService.upload({
        file: file,
        folder: "blog",
      });

      const imageUrl = mediaService.getPublicUrl(media);

      if (editor.value) {
        editor.value.chain().focus().setImage({ src: imageUrl }).run();
      }

      return { id: media.id, url: imageUrl };
    } catch (error) {
      console.error("Media upload failed:", error);
      throw error;
    } finally {
      isUploadingImage.value = false;
    }
  }

  // Insert image from URL
  function insertImageFromUrl(url: string) {
    if (url && editor.value) {
      editor.value.chain().focus().setImage({ src: url }).run();
      return true;
    }
    return false;
  }

  return {
    showImageUploader,
    isUploadingImage,
    handleFileUpload,
    handleDrop,
    uploadAndInsertImage,
    insertImageFromUrl,
  };
}
