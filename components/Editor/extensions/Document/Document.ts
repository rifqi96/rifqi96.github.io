import { Node } from "@tiptap/core";
import Document from "@tiptap/extension-document";

// Extend the Document extension to enforce a specific structure
export const CustomDocument = Document.extend({
  name: "document",

  // Override content to enforce our structure:
  // Featured image (required) followed by block wrappers
  content: "featuredImage blockWrapper+",

  // Additional configuration to ensure proper structure
  addOptions() {
    return {
      ...this.parent?.(),
    };
  },

  // Override the toDOM method to add custom attributes if needed
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: "custom-document",
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          if (!attributes.class) {
            return {};
          }

          return {
            class: attributes.class,
          };
        },
      },
    };
  },
});
