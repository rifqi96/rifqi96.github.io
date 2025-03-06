<script setup lang="ts">
import { ref, computed } from "vue";
import Draggable from "vuedraggable-es";

const props = defineProps({
  /**
   * Items to be displayed in the draggable list
   */
  modelValue: {
    type: Array as () => any[],
    required: true,
  },
  /**
   * Unique key property name to identify each item
   */
  itemKey: {
    type: String,
    default: "id",
  },
  /**
   * CSS selector for the drag handle
   */
  handle: {
    type: String,
    default: ".handle",
  },
  /**
   * Animation duration in milliseconds
   */
  animation: {
    type: Number,
    default: 200,
  },
  /**
   * CSS class for the ghost element during dragging
   */
  ghostClass: {
    type: String,
    default: "ghost-project",
  },
});

const emit = defineEmits(["update:modelValue", "start", "end", "change"]);

const isDragging = ref(false);

// Create a computed property for the model
const items = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

/**
 * Handle drag start event
 */
function onDragStart(e: any) {
  isDragging.value = true;
  emit("start", e);
}

/**
 * Handle drag end event
 */
function onDragEnd(e: any) {
  isDragging.value = false;
  emit("end", e);
}

/**
 * Handle change during drag
 */
function onDragChange(e: any) {
  emit("change", e);
}
</script>

<template>
  <div class="draggable-wrapper">
    <Draggable
      v-model="items"
      :item-key="itemKey"
      :handle="handle"
      @start="onDragStart"
      @end="onDragEnd"
      @change="onDragChange"
      :animation="animation"
      :ghost-class="ghostClass"
    >
      <template #item="slotProps">
        <slot name="item" v-bind="slotProps" :is-dragging="isDragging"></slot>
      </template>

      <!-- Header slot for additional content above the list -->
      <template #header v-if="$slots.header">
        <slot name="header"></slot>
      </template>

      <!-- Footer slot for additional content below the list -->
      <template #footer v-if="$slots.footer">
        <slot name="footer"></slot>
      </template>
    </Draggable>
  </div>
</template>

<style scoped>
/* Draggable styles ported from the original component */
.draggable-projects-container {
  padding: 8px 0;
}

.draggable-project {
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.draggable-project:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.drag-handle {
  cursor: grab;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.draggable-project:hover .drag-handle {
  color: rgba(var(--v-theme-primary), 0.8);
}

:deep(.ghost-project) {
  opacity: 0.5;
  background: rgb(var(--v-theme-surface-variant));
}

.is-dragging {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.order-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  font-weight: bold;
  font-size: 14px;
}
</style>
