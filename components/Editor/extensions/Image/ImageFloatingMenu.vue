<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { NodeSelection } from "prosemirror-state";

const props = defineProps<{
  editor: any;
}>();

const showMenu = ref(false);
const menuPosition = ref({ left: 0, top: 0 });
const showImageUrlInput = ref(false);
const imageUrl = ref("");
const showCaptionHelp = ref(false);

// Check if an image is selected
const isImageSelected = computed(() => {
  if (!props.editor || !props.editor.isActive) return false;

  const { selection } = props.editor.state;
  return (
    selection instanceof NodeSelection && selection.node.type.name === "image"
  );
});

// Get current image attributes
const currentAlignment = computed(() => {
  if (!isImageSelected.value) return null;

  const { selection } = props.editor.state;
  return selection.node.attrs.indentation || "left";
});

const currentCaption = computed(() => {
  if (!isImageSelected.value) return null;

  const { selection } = props.editor.state;
  return selection.node.attrs.caption || "";
});

const currentImageUrl = computed(() => {
  if (!isImageSelected.value) return null;

  const { selection } = props.editor.state;
  return selection.node.attrs.src || "";
});

// Functions to handle image actions
function setAlignment(alignment: "left" | "center" | "right") {
  console.log("Image floating menu: setting alignment to", alignment);

  // Try to use the setImageAlignment command first
  try {
    // Make sure we're dealing with a direct image node selection
    if (isImageSelected.value) {
      // Debug image attributes
      const { selection } = props.editor.state;
      console.log("Current image attributes:", selection.node.attrs);

      console.log("Using editor command setImageAlignment");
      const result = props.editor
        .chain()
        .focus()
        .setImageAlignment(alignment)
        .run();
      console.log("Command result:", result);

      // Log updated attributes
      setTimeout(() => {
        const { selection } = props.editor.state;
        if (
          selection instanceof NodeSelection &&
          selection.node.type.name === "image"
        ) {
          console.log("Updated image attributes:", selection.node.attrs);
        }
        props.editor.commands.focus();
      }, 10);
    } else {
      console.log("No image selected, cannot apply alignment");
    }
  } catch (error) {
    console.error("Error applying image alignment:", error);
  }
}

function removeImage() {
  props.editor.chain().focus().deleteSelection().run();
}

function toggleCaption() {
  if (currentCaption.value) {
    // Remove caption
    props.editor.chain().focus().setImageCaption("").run();
  } else {
    // Add an empty caption and show help
    props.editor.chain().focus().setImageCaption(" ").run();
    showCaptionHelp.value = true;

    // Auto-hide help after 5 seconds
    setTimeout(() => {
      showCaptionHelp.value = false;
    }, 5000);
  }
}

function toggleImageUrlInput() {
  if (!showImageUrlInput.value) {
    imageUrl.value = currentImageUrl.value || "";
  }
  showImageUrlInput.value = !showImageUrlInput.value;
}

function saveImageUrl() {
  if (isImageSelected.value && imageUrl.value) {
    // Update the image source
    const { selection } = props.editor.state;
    props.editor
      .chain()
      .focus()
      .setImage({
        src: imageUrl.value,
        // Preserve other attributes
        alt: selection.node.attrs.alt,
        title: selection.node.attrs.title,
        width: selection.node.attrs.width,
        height: selection.node.attrs.height,
        caption: selection.node.attrs.caption,
        indentation: selection.node.attrs.indentation,
      })
      .run();
    showImageUrlInput.value = false;
  }
}

function openImageUploadDialog() {
  // Create and dispatch event to open the image upload dialog
  const customEvent = new CustomEvent("tiptap-image-dialog", {
    bubbles: true,
    cancelable: true,
  });
  props.editor.view.dom.dispatchEvent(customEvent);
  showImageUrlInput.value = false; // Close URL input if open
}

// Handle menu positioning
function updateMenuPosition() {
  if (!isImageSelected.value || !props.editor) {
    showMenu.value = false;
    return;
  }

  showMenu.value = true;

  // Get the selected node's DOM element
  const { selection } = props.editor.state;
  const nodePos = selection.from;
  const dom = props.editor.view.nodeDOM(nodePos);

  if (!dom) {
    // Fallback to editor position
    const editorView = props.editor.view.dom;
    const rect = editorView.getBoundingClientRect();
    menuPosition.value = {
      left: rect.left + rect.width / 2,
      top: rect.top,
    };
    return;
  }

  // Position above the image
  const rect = dom.getBoundingClientRect();
  menuPosition.value = {
    left: rect.left + rect.width / 2,
    top: rect.top - 50, // Position above image
  };
}

// Update position on selection changes
function onSelectionUpdate() {
  updateMenuPosition();
}

// Set up event listener
onMounted(() => {
  if (props.editor) {
    props.editor.on("selectionUpdate", onSelectionUpdate);
    updateMenuPosition();
  }
});

// Clean up event listener
onBeforeUnmount(() => {
  if (props.editor) {
    props.editor.off("selectionUpdate", onSelectionUpdate);
  }
});
</script>

<template>
  <div
    v-if="showMenu && isImageSelected"
    class="image-floating-menu"
    :style="{
      left: `${menuPosition.left}px`,
      top: `${menuPosition.top}px`,
    }"
  >
    <div class="image-floating-menu__content">
      <button
        class="menu-button"
        :class="{ 'is-active': currentAlignment === 'left' }"
        @click="setAlignment('left')"
        title="Align left"
      >
        <v-icon>mdi-format-align-left</v-icon>
      </button>

      <button
        class="menu-button"
        :class="{ 'is-active': currentAlignment === 'center' }"
        @click="setAlignment('center')"
        title="Align center"
      >
        <v-icon>mdi-format-align-center</v-icon>
      </button>

      <button
        class="menu-button"
        :class="{ 'is-active': currentAlignment === 'right' }"
        @click="setAlignment('right')"
        title="Align right"
      >
        <v-icon>mdi-format-align-right</v-icon>
      </button>

      <div class="menu-divider"></div>

      <!-- Caption button - changed to toggle caption -->
      <button
        class="menu-button"
        :class="{ 'is-active': !!currentCaption }"
        @click="toggleCaption"
        title="Toggle caption"
      >
        <v-icon>mdi-text</v-icon>
      </button>

      <!-- Image source options -->
      <button
        class="menu-button"
        :class="{ 'is-active': showImageUrlInput }"
        @click="toggleImageUrlInput"
        title="Image URL"
      >
        <v-icon>mdi-link</v-icon>
      </button>

      <button
        class="menu-button"
        @click="openImageUploadDialog"
        title="Upload image"
      >
        <v-icon>mdi-upload</v-icon>
      </button>

      <div class="menu-divider"></div>

      <button
        class="menu-button menu-button--danger"
        @click="removeImage"
        title="Remove image"
      >
        <v-icon>mdi-delete</v-icon>
      </button>
    </div>

    <!-- Caption info tooltip (new) -->
    <div v-if="showCaptionHelp" class="image-floating-menu__tooltip">
      <div class="tooltip-content">
        <p>
          You can directly edit the caption below the image. Click on it to
          start editing.
        </p>
        <button @click="showCaptionHelp = false" class="close-tooltip">
          Got it
        </button>
      </div>
    </div>

    <!-- Image URL input -->
    <div v-if="showImageUrlInput" class="image-floating-menu__input-panel">
      <input
        type="text"
        v-model="imageUrl"
        placeholder="Enter image URL..."
        class="url-input"
        @keydown.enter="saveImageUrl"
      />
      <div class="input-actions">
        <button @click="showImageUrlInput = false" class="cancel-button">
          Cancel
        </button>
        <button @click="saveImageUrl" class="save-button">Apply</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.image-floating-menu {
  position: fixed;
  z-index: 50;
  transform: translateX(-50%); // Center horizontally
  pointer-events: none;

  &__content {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    padding: 4px;
    pointer-events: auto;
  }

  &__input-panel {
    margin-top: 8px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 8px;
    pointer-events: auto;
    width: 280px;
  }

  .caption-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .input-panel-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .input-button {
    padding: 6px 12px;
    border-radius: 4px;
    border: none;
    font-size: 14px;
    cursor: pointer;

    &--cancel {
      background-color: #f5f5f5;
      color: #333;

      &:hover {
        background-color: #e5e5e5;
      }
    }

    &--save {
      background-color: rgba(var(--v-theme-primary), 1);
      color: white;

      &:hover {
        background-color: rgba(var(--v-theme-primary), 0.9);
      }
    }
  }

  .menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 4px;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(var(--v-theme-primary), 0.1);
    }

    &.is-active {
      background-color: rgba(var(--v-theme-primary), 0.15);
      color: rgb(var(--v-theme-primary));
    }

    &--danger:hover {
      background-color: rgba(var(--v-theme-error), 0.1);
      color: rgb(var(--v-theme-error));
    }
  }

  .menu-divider {
    height: 24px;
    width: 1px;
    background-color: rgba(0, 0, 0, 0.1);
    margin: 0 4px;
  }
}

.image-floating-menu__tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10px;
  width: 250px;
  background-color: white;
  border-radius: 6px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 30;
}

.tooltip-content {
  font-size: 14px;
  text-align: center;
}

.close-tooltip {
  background-color: #f1f1f1;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  margin-top: 8px;
  cursor: pointer;
  font-size: 12px;
}

.close-tooltip:hover {
  background-color: #e5e5e5;
}
</style>
