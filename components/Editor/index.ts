// Re-export the Editor component
export { default } from "./Editor.vue";

// Export composables for use in other components
export * from "./composables/useEditorConfig";
export * from "./composables/useImageUpload";
export * from "./composables/useEditorEvents";
export * from "./composables/useImageIndentation";

// Export extension utilities
export * from "./extensions";
