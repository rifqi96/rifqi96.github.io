import { Node } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import FeaturedImageView from "./FeaturedImageView.vue";
import type { Media } from "@/types/Media";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    featuredImage: {
      /**
       * Set a featured image
       */
      setFeaturedImage: (attributes: {
        mediaId?: string;
        imageUrl?: string;
        media?: Media | null;
      }) => ReturnType;
      /**
       * Remove the featured image
       */
      removeFeaturedImage: () => ReturnType;
    };
  }
}

export const FeaturedImage = Node.create({
  name: "featuredImage",

  group: "block",

  // Make it a top-level block
  content: "",

  // Define the attributes it can have
  addAttributes() {
    return {
      mediaId: {
        default: null,
      },
      imageUrl: {
        default: null,
      },
      media: {
        default: null,
        parseHTML: () => null,
        renderHTML: () => null,
      },
      position: {
        default: 0,
      },
    };
  },

  // Ensure it's always at the top
  parseHTML() {
    return [
      {
        tag: 'div[data-type="featured-image"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-type": "featured-image", ...HTMLAttributes }, 0];
  },

  // Add commands to add/remove the featured image
  addCommands() {
    return {
      setFeaturedImage:
        (attributes: {
          mediaId?: string;
          imageUrl?: string;
          media?: Media | null;
        }) =>
        ({ chain }) => {
          // First check if a featured image already exists
          const hasFeaturedImage =
            this.editor.state.doc.firstChild?.type.name === this.name;

          if (hasFeaturedImage) {
            // Update existing featured image
            return chain()
              .command(({ tr }) => {
                tr.setNodeMarkup(0, undefined, attributes);
                return true;
              })
              .run();
          } else {
            // Insert new featured image at the beginning
            return chain()
              .command(({ tr, dispatch }) => {
                if (dispatch) {
                  const node = this.type.create(attributes);
                  tr.insert(0, node);
                }
                return true;
              })
              .run();
          }
        },
      removeFeaturedImage:
        () =>
        ({ chain }) => {
          // Remove the featured image if it exists
          const hasFeaturedImage =
            this.editor.state.doc.firstChild?.type.name === this.name;

          if (hasFeaturedImage) {
            return chain()
              .command(({ tr, dispatch }) => {
                if (dispatch) {
                  const firstChild = this.editor.state.doc.firstChild;
                  if (firstChild) {
                    tr.deleteRange(0, firstChild.nodeSize);
                  }
                }
                return true;
              })
              .run();
          }

          return true;
        },
    };
  },

  // Use a Vue component for the node view
  addNodeView() {
    return VueNodeViewRenderer(FeaturedImageView);
  },
});
