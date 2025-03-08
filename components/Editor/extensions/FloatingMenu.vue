<template>
  <div
    v-if="showMenu"
    class="floating-menu"
    :style="{
      left: menuLeft + 'px',
      top: menuTop + 'px',
      transform: `translateY(${menuOffset}px)`,
    }"
    :class="{ 'bottom-position': isBottomPosition }"
  >
    <div class="menu-buttons">
      <button :class="{ active: isBold() }" @click="toggleBold" title="Bold">
        <span class="icon">B</span>
      </button>
      <button
        :class="{ active: isItalic() }"
        @click="toggleItalic"
        title="Italic"
      >
        <span class="icon">I</span>
      </button>
      <button
        :class="{ active: isUnderline() }"
        @click="toggleUnderline"
        title="Underline"
      >
        <span class="icon">U</span>
      </button>
      <button
        :class="{ active: isCodeStyle() }"
        @click="toggleCodeStyle"
        title="Code"
      >
        <span class="icon">{ }</span>
      </button>
      <button @click="openLinkDialog" title="Link">
        <span class="icon">🔗</span>
      </button>
      <div class="dropdown" ref="headingDropdownRef">
        <button
          class="dropdown-toggle"
          title="Heading"
          @mousedown.prevent="toggleHeadingMenu"
        >
          <span class="icon">H</span>
        </button>
        <div class="dropdown-menu" v-if="showHeadingMenu">
          <button
            @mousedown.prevent="toggleHeading(1)"
            :class="{ active: isHeading(1) }"
          >
            H1
          </button>
          <button
            @mousedown.prevent="toggleHeading(2)"
            :class="{ active: isHeading(2) }"
          >
            H2
          </button>
          <button
            @mousedown.prevent="toggleHeading(3)"
            :class="{ active: isHeading(3) }"
          >
            H3
          </button>
        </div>
      </div>

      <!-- Indentation Buttons (replacing Text Alignment) -->
      <button
        :class="{ active: isIndented('left') }"
        @click="setIndentation('left')"
        title="Left Indentation"
      >
        <span class="icon" style="font-family: monospace">◄</span>
      </button>
      <button
        :class="{ active: isIndented('center') }"
        @click="setIndentation('center')"
        title="Center Indentation"
      >
        <span class="icon" style="font-family: monospace">◆</span>
      </button>
      <button
        :class="{ active: isIndented('right') }"
        @click="setIndentation('right')"
        title="Right Indentation"
      >
        <span class="icon" style="font-family: monospace">►</span>
      </button>
    </div>
  </div>

  <!-- Custom Link Dialog -->
  <LinkDialog
    v-model:show="showLinkDialog"
    :initial-text="selectedText"
    :initial-url="currentLinkUrl"
    :can-edit-text="!hasSelection"
    @submit="handleLinkSubmit"
    @cancel="closeLinkDialog"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import type { Editor } from "@tiptap/vue-3";
import Underline from "./Underline/Underline";
import LinkDialog from "./Link/LinkDialog.vue";
import { NodeSelection } from "prosemirror-state";

const props = defineProps({
  editor: {
    type: Object as () => Editor | null,
    required: true,
  },
});

const editor = props.editor;
const showMenu = ref(false);
const menuLeft = ref(0);
const menuTop = ref(0);
const menuOffset = ref(0);
const isBottomPosition = ref(false);
const viewportHeight = ref(window.innerHeight);
const showHeadingMenu = ref(false);
const headingDropdownRef = ref<HTMLElement | null>(null);

// Link dialog state
const showLinkDialog = ref(false);
const selectedText = ref("");
const currentLinkUrl = ref("");
const hasSelection = ref(false);

// Update viewport height on resize
function updateViewportHeight() {
  viewportHeight.value = window.innerHeight;
}

function updateMenuPosition() {
  if (!props.editor) return;

  const selection = props.editor?.view.state.selection;

  // Don't show the regular floating menu when an image is selected
  if (
    selection instanceof NodeSelection &&
    selection.node.type.name === "image"
  ) {
    showMenu.value = false;
    return;
  }

  if (selection?.empty) {
    showMenu.value = false;
    return;
  }

  const { from, to } = selection;
  const start = props.editor?.view.coordsAtPos(from);
  const end = props.editor?.view.coordsAtPos(to);

  if (!start || !end) return;

  // Calculate menu position
  const menuHeight = 40; // Approximate height of menu
  const buffer = 10; // Buffer space
  const editorElement = props.editor.view.dom;
  const editorRect = editorElement.getBoundingClientRect();

  // Determine if we're near the top or bottom of the viewport
  const viewportTop = window.scrollY;
  const viewportBottom = viewportTop + window.innerHeight;

  // Check if selection is near the top of the viewport
  isBottomPosition.value = start.top - viewportTop < 100;

  if (isBottomPosition.value) {
    // Position below the selection with offset relative to editor
    menuTop.value =
      end.bottom + buffer - editorRect.top + editorElement.scrollTop;
    menuOffset.value = 0;
  } else {
    // Position above the selection with offset relative to editor
    menuTop.value = start.top - editorRect.top + editorElement.scrollTop;
    menuOffset.value = -(menuHeight + buffer);
  }

  // Center horizontally over the selection
  const selectionWidth = end.left - start.left;
  menuLeft.value = start.left - editorRect.left + selectionWidth / 2;

  // Keep menu within the bounds of the editor horizontally
  const menuWidth = 280; // Approximate menu width
  const minLeft = 10;
  const maxLeft = editorRect.width - menuWidth - 10;

  menuLeft.value = Math.max(minLeft, Math.min(menuLeft.value, maxLeft));

  showMenu.value = true;
}

function toggleHeadingMenu() {
  showHeadingMenu.value = !showHeadingMenu.value;

  // If we're opening the menu, add a one-time event listener to close it
  if (showHeadingMenu.value) {
    setTimeout(() => {
      window.addEventListener("mousedown", closeHeadingMenuOnClickOutside, {
        once: true,
      });
    }, 0);
  }
}

function closeHeadingMenuOnClickOutside(event) {
  if (
    headingDropdownRef.value &&
    !headingDropdownRef.value.contains(event.target)
  ) {
    showHeadingMenu.value = false;
  }
}

// Link handling methods
function openLinkDialog() {
  if (!props.editor) return;

  const { state, view } = props.editor;
  const { from, to } = state.selection;

  // Check if there's a selection
  hasSelection.value = from !== to;

  // Get the selected text if any
  if (hasSelection.value) {
    selectedText.value = state.doc.textBetween(from, to);
  } else {
    selectedText.value = "";
  }

  // Check if cursor is on a link
  const node = state.doc.nodeAt(from);
  const marks = node?.marks || [];
  const linkMark = marks.find((mark) => mark.type.name === "link");

  if (linkMark) {
    currentLinkUrl.value = linkMark.attrs.href || "";
  } else {
    currentLinkUrl.value = "";
  }

  showLinkDialog.value = true;
}

function handleLinkSubmit(data: { text: string; url: string }) {
  if (!props.editor) return;

  const { from, to } = props.editor.state.selection;
  const hasTextSelected = from !== to;

  if (hasTextSelected) {
    // If text is selected, just set the link on the selection
    props.editor.chain().focus().setLink({ href: data.url }).run();
  } else if (data.text) {
    // If no text is selected but we have text input, insert content with link
    props.editor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: data.text,
        marks: [
          {
            type: "link",
            attrs: {
              href: data.url,
            },
          },
        ],
      })
      .run();
  }

  closeLinkDialog();
}

function closeLinkDialog() {
  showLinkDialog.value = false;
  selectedText.value = "";
  currentLinkUrl.value = "";
}

function toggleBold() {
  props.editor?.chain().toggleBold().focus().run();
}

function toggleItalic() {
  props.editor?.chain().toggleItalic().focus().run();
}

function toggleUnderline() {
  props.editor?.chain().toggleMark("underline").focus().run();
}

const isBold = () => {
  return props.editor?.isActive("bold");
};

const isItalic = () => {
  return props.editor?.isActive("italic");
};

const isUnderline = () => {
  return props.editor?.isActive("underline");
};

const toggleCodeStyle = () => {
  props.editor?.chain().toggleCodeStyle().focus().run();
};

const isCodeStyle = () => {
  if (!props.editor) return false;
  const { from, to } = props.editor.state.selection;
  return props.editor.isActive("codeStyle");
};

const toggleHeading = (level: number) => {
  const headingClass = `text-h${level}`;
  if (isHeading(level)) {
    props.editor?.chain().focus().setNode("paragraph").run();
  } else {
    props.editor
      ?.chain()
      .focus()
      .setNode("heading", { level, class: headingClass })
      .run();
  }

  // Close the heading menu after selecting a heading
  showHeadingMenu.value = false;
};

const isHeading = (level: number) => {
  const headingClass = `text-h${level}`;
  return props.editor?.isActive("heading", { class: headingClass });
};

// Text alignment functions
const setIndentation = (indentation: string) => {
  if (!props.editor) return;

  // Get the current selection
  const { state } = props.editor;
  const { selection } = state;
  let hasImage = false;

  // Check for image nodes in selection
  state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
    if (node.type.name === "image") {
      hasImage = true;
      return false; // Stop searching
    }
    return true;
  });

  if (hasImage) {
    // For images, we need to use the custom function that's defined in the parent Editor.vue
    // This is defined in Editor.vue as setImageIndentation
    // We'll emit a custom event for the parent component to handle
    const event = new CustomEvent("tiptap-set-image-indentation", {
      bubbles: true,
      detail: { indentation },
    });
    props.editor.view.dom.dispatchEvent(event);
  } else {
    // For regular content, use the standard indentation command
    props.editor
      .chain()
      .command(({ commands }) => {
        return commands.setIndentation(indentation);
      })
      .focus()
      .run();
  }
};

const isIndented = (indentation: string) => {
  if (!props.editor) return false;

  // Get the current selection
  const { state } = props.editor;
  const { selection } = state;
  const { $from } = selection;

  // Check if we're in an image node
  let imageNode;
  state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
    if (node.type.name === "image") {
      imageNode = node;
      return false; // Stop searching
    }
    return true;
  });

  if (imageNode) {
    return imageNode.attrs.indentation === indentation;
  }

  // Try to find blockWrapper parent
  for (let i = $from.depth; i > 0; i--) {
    const node = $from.node(i);
    if (node.type.name === "blockWrapper") {
      return node.attrs.indentation === indentation;
    }
  }

  // If no blockWrapper found, check the parent node
  const node = $from.parent;

  // If checking for normal (default) indentation
  if (indentation === "normal") {
    // If the indentation attribute is missing or set to normal
    return !node.attrs.indentation || node.attrs.indentation === "normal";
  }

  // For other indentation values, check if they match
  return node.attrs.indentation === indentation;
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && showMenu.value) {
    showMenu.value = false;
    showHeadingMenu.value = false;
  }
};

// Make sure to recalculate position on scroll and resize
function setupEventListeners() {
  window.addEventListener("scroll", updateMenuPosition);
  window.addEventListener("resize", updateViewportHeight);
}

function cleanupEventListeners() {
  window.removeEventListener("scroll", updateMenuPosition);
  window.removeEventListener("resize", updateViewportHeight);
}

onMounted(() => {
  if (props.editor) {
    props.editor.on("selectionUpdate", updateMenuPosition);
    setupEventListeners();
    updateMenuPosition();
  }

  // Add key listener for Escape to close the menu
  document.addEventListener("keydown", handleKeyDown);

  // Check if selection is still active after commands
  props.editor?.on("transaction", ({ transaction }) => {
    // If user starts typing (insertText) or does something that removes selection, close menu
    if (
      transaction.docChanged &&
      (transaction.getMeta("inputType") === "insertText" ||
        props.editor?.state.selection.empty)
    ) {
      showMenu.value = false;
      showHeadingMenu.value = false;
    }
  });
});

onUnmounted(() => {
  if (props.editor) {
    props.editor.off("selectionUpdate", updateMenuPosition);
    cleanupEventListeners();
  }

  // Only hide the menu on blur if there's no longer a selection
  if (props.editor && props.editor.state.selection.empty) {
    showMenu.value = false;
    showHeadingMenu.value = false;
  }

  props.editor?.off("transaction");
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
.floating-menu {
  position: absolute;
  z-index: 20;
  margin-left: -140px; /* Center menu horizontally (half of menu width) */
  background-color: white;
  border-radius: 0.5rem;
  padding: 0.5rem;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  width: 280px;
}

.bottom-position {
  transform: translate(-50%, 0);
}

.menu-buttons {
  display: flex;
  align-items: center;
  gap: 2px;
}

.floating-menu button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background-color: transparent;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  color: #555;
  transition: all 0.2s ease;
  margin: 0;
  padding: 0;
}

.floating-menu button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #000;
}

.floating-menu button.active {
  background-color: rgba(0, 0, 0, 0.1);
  color: #000;
  font-weight: 500;
}

.icon {
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  width: 28px;
  height: 28px;
  border: none;
  background-color: transparent;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  color: #555;
  transition: all 0.2s ease;
}

.dropdown-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #000;
}

.dropdown-menu {
  position: absolute;
  top: 32px;
  right: 0;
  background-color: #ffffff;
  min-width: 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  padding: 4px 0;
  z-index: 101;
  font-size: 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dropdown-menu button {
  color: #555;
  padding: 6px 12px;
  text-decoration: none;
  display: block;
  text-align: left;
  border: none;
  background-color: transparent;
  width: 100%;
  cursor: pointer;
  font-weight: normal;
  transition: all 0.2s ease;
}

.dropdown-menu button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #000;
}

.dropdown-menu button.active {
  background-color: rgba(0, 0, 0, 0.1);
  color: #000;
  font-weight: 500;
}
</style>
