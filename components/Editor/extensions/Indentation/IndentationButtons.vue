<script setup lang="ts">
import { Editor } from "@tiptap/vue-3";

const props = defineProps<{
  editor: Editor;
}>();

const setIndentation = (indentation: string) => {
  props.editor
    .chain()
    .focus()
    .command(({ commands }) => {
      return commands.setIndentation(indentation);
    })
    .run();
};

const isActive = (indentation: string) => {
  // Get the current node
  const { state } = props.editor;
  const { selection } = state;
  const node = selection.$head.parent;

  // Check if the current node has the specified indentation
  return node.attrs.indentation === indentation;
};
</script>

<template>
  <div class="indentation-buttons">
    <button
      class="indentation-button"
      :class="{ active: isActive('normal') }"
      @click="setIndentation('normal')"
      title="Normal Indentation"
    >
      <i class="fa fa-align-justify"></i>
    </button>
    <button
      class="indentation-button"
      :class="{ active: isActive('left') }"
      @click="setIndentation('left')"
      title="Left Indentation"
    >
      <i class="fa fa-align-left"></i>
    </button>
    <button
      class="indentation-button"
      :class="{ active: isActive('center') }"
      @click="setIndentation('center')"
      title="Center Indentation"
    >
      <i class="fa fa-align-center"></i>
    </button>
    <button
      class="indentation-button"
      :class="{ active: isActive('right') }"
      @click="setIndentation('right')"
      title="Right Indentation"
    >
      <i class="fa fa-align-right"></i>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.indentation-buttons {
  display: flex;
  gap: 4px;
}

.indentation-button {
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background-color: #f5f5f5;
  }

  &.active {
    background-color: #ddd;
  }
}
</style>
