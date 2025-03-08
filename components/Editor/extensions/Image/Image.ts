import { Image as TiptapImage } from "@tiptap/extension-image";
import { Plugin, PluginKey } from "prosemirror-state";
import { Node as ProsemirrorNode } from "prosemirror-model";
import { NodeSelection } from "prosemirror-state";

// Remove the problematic interface extensions

const Image = TiptapImage.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      allowBase64: true,
      HTMLAttributes: {
        class: "editor-image",
        draggable: "true",
      },
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      caption: {
        default: null,
        parseHTML: (element) => {
          // Try to find a figcaption element inside the figure parent
          const figure = element.closest("figure");
          if (figure) {
            const figcaption = figure.querySelector("figcaption");
            return figcaption ? figcaption.textContent : null;
          }
          // Try to find a data-caption attribute directly
          return element.getAttribute("data-caption");
        },
        renderHTML: (attributes) => {
          if (!attributes.caption) {
            return {};
          }
          return { "data-caption": attributes.caption };
        },
      },
      indentation: {
        default: "left",
        parseHTML: (element) => {
          const figure = element.closest("figure");
          const target = figure || element;

          // Look for data-indentation attribute first
          const indentation = target.getAttribute("data-indentation");
          if (indentation) return indentation;

          // Fall back to class-based detection
          if (
            target.classList.contains("text-center") ||
            target.classList.contains("center-aligned") ||
            target.classList.contains("editor-image-center")
          ) {
            return "center";
          }

          if (
            target.classList.contains("text-right") ||
            target.classList.contains("right-aligned") ||
            target.classList.contains("editor-image-right")
          ) {
            return "right";
          }

          return "left";
        },
        renderHTML: (attributes) => {
          if (!attributes.indentation || attributes.indentation === "left") {
            return { "data-indentation": "left" };
          }
          return {
            "data-indentation": attributes.indentation,
          };
        },
      },
    };
  },

  // Override the renderHTML method to include the caption and indentation
  renderHTML({ HTMLAttributes }) {
    const { caption, indentation, ...rest } = HTMLAttributes;

    // Ensure indentation has a value
    const actualIndentation = indentation || "left";

    // Add indentation classes for styling
    const indentClass = `editor-image-${actualIndentation}`;

    // Add the indentation attribute to both the wrapper and the image
    const imageAttrs = {
      ...rest,
      class: `editor-image ${indentClass}`,
      "data-indentation": actualIndentation,
    };

    if (caption) {
      // If we have a caption, render as a figure with figcaption
      const figureAttrs = {
        class: `editor-image-figure ${indentClass}`,
        "data-indentation": actualIndentation,
      };

      return [
        "figure",
        figureAttrs,
        ["img", imageAttrs],
        [
          "figcaption",
          {
            class: "editor-image-caption",
            contenteditable: "true",
            "data-caption-editable": "true",
          },
          caption,
        ],
      ];
    }

    // Otherwise, just render as an image with proper attributes
    return ["img", imageAttrs];
  },

  addProseMirrorPlugins() {
    const plugins = this.parent?.() || [];

    // Add a plugin to handle image selection, resizing, and drag-and-drop
    const imageSelectionPlugin = new Plugin({
      key: new PluginKey("imageSelection"),
      props: {
        handleDOMEvents: {
          // Handle image selection
          click: (view, event) => {
            const target = event.target as HTMLElement;

            if (
              target.tagName === "IMG" &&
              target.classList.contains("editor-image")
            ) {
              // Select the image node
              const pos = view.posAtDOM(target, 0);
              const node = view.state.doc.nodeAt(pos);

              if (node && node.type.name === "image") {
                const tr = view.state.tr.setSelection(
                  NodeSelection.create(view.state.doc, pos),
                );
                view.dispatch(tr);
                return true;
              }
            }

            return false;
          },

          // Handle caption edits directly in the DOM
          input: (view, event) => {
            const target = event.target as HTMLElement;

            if (target.getAttribute("data-caption-editable") === "true") {
              const figureElement = target.closest("figure");
              if (figureElement) {
                const imgElement = figureElement.querySelector("img");
                if (imgElement) {
                  const pos = view.posAtDOM(imgElement, 0);
                  const node = view.state.doc.nodeAt(pos);

                  if (node && node.type.name === "image") {
                    const newCaption = target.textContent || "";
                    const tr = view.state.tr.setNodeMarkup(pos, undefined, {
                      ...node.attrs,
                      caption: newCaption,
                    });
                    view.dispatch(tr);
                  }
                }
              }
            }

            return false;
          },

          // Custom drop handler for images
          drop: (view, event) => {
            // Only handle image drops, let the editor handle other drops
            if (!event.dataTransfer?.files?.length) {
              return false;
            }

            const files = Array.from(event.dataTransfer.files);
            const imageFiles = files.filter((file) =>
              file.type.startsWith("image/"),
            );

            if (!imageFiles.length) {
              return false;
            }

            // Prevent default to stop editor's built-in handling of files
            event.preventDefault();

            // Dispatch a custom event with the file
            const customEvent = new CustomEvent("tiptap-image-upload", {
              bubbles: true,
              cancelable: true,
              detail: { file: imageFiles[0] },
            });
            view.dom.dispatchEvent(customEvent);

            return true;
          },

          // Handle paste events for images
          paste: (view, event) => {
            // Handle pasting images
            if (!event.clipboardData?.files?.length) {
              return false;
            }

            const files = Array.from(event.clipboardData.files);
            const imageFiles = files.filter((file) =>
              file.type.startsWith("image/"),
            );

            if (!imageFiles.length) {
              return false;
            }

            // Prevent default to stop default handling
            event.preventDefault();

            // Dispatch a custom event with the file
            const customEvent = new CustomEvent("tiptap-image-upload", {
              bubbles: true,
              cancelable: true,
              detail: { file: imageFiles[0] },
            });
            view.dom.dispatchEvent(customEvent);

            return true;
          },
        },
      },
    });

    return [...plugins, imageSelectionPlugin];
  },

  // Update commands to use indentation
  addCommands() {
    return {
      ...this.parent?.(),

      // Standard commands for image manipulation
      setImageAlignment:
        (alignment) =>
        ({ editor, tr, dispatch }) => {
          // Find selected node
          const { selection } = tr;

          // Check if we have a proper image selection
          if (
            !(selection instanceof NodeSelection) ||
            selection.node.type.name !== "image"
          ) {
            console.log("setImageAlignment: not a valid image selection");
            return false;
          }

          console.log(
            "setImageAlignment: applying alignment",
            alignment,
            "to image at position",
            selection.from,
          );

          try {
            if (dispatch) {
              // Update the image node directly
              tr.setNodeMarkup(selection.from, undefined, {
                ...selection.node.attrs,
                indentation: alignment,
              });

              // Also look for parent blockWrapper and update it
              const $pos = tr.doc.resolve(selection.from);
              for (let i = $pos.depth; i > 0; i--) {
                const node = $pos.node(i);
                const pos = $pos.before(i);

                if (node.type.name === "blockWrapper") {
                  console.log(
                    "setImageAlignment: also updating parent blockWrapper",
                  );
                  tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    indentation: alignment,
                  });
                  break;
                }
              }
            }

            return true;
          } catch (error) {
            console.error("Error in setImageAlignment:", error);
            return false;
          }
        },

      setImageCaption:
        (caption) =>
        ({ tr, dispatch }) => {
          // Find selected node
          const { selection } = tr;
          if (
            !(selection instanceof NodeSelection) ||
            selection.node.type.name !== "image"
          ) {
            return false;
          }

          if (dispatch) {
            tr.setNodeMarkup(selection.from, undefined, {
              ...selection.node.attrs,
              caption,
            });
          }

          return true;
        },
    };
  },
});

export default Image;
