import { Extension } from "@tiptap/core";

// Define types needed for indentation
const DEFAULT_INDENTATION_TYPES = [
  "heading",
  "paragraph",
  "image",
  "blockquote",
  "codeBlock",
  "blockWrapper",
];
const INDENTATION_VALUES = ["left", "center", "right"];

// Extend the Commands interface to include our indentation commands
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    indentation: {
      /**
       * Set the indentation for a node
       */
      setIndentation: (indentation: string) => ReturnType;
    };
  }
}

// Create the extension similar to how TipTap's TextAlign works
export const Indentation = Extension.create({
  name: "indentation",

  addOptions() {
    return {
      types: DEFAULT_INDENTATION_TYPES,
      defaultIndentation: "left",
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indentation: {
            default: this.options.defaultIndentation,
            parseHTML: (element) =>
              element.getAttribute("data-indentation") ||
              this.options.defaultIndentation,
            renderHTML: (attributes) => {
              if (
                !attributes.indentation ||
                attributes.indentation === this.options.defaultIndentation
              ) {
                return {};
              }

              return {
                "data-indentation": attributes.indentation,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setIndentation:
        (indentation: string) =>
        ({ commands, editor }) => {
          if (!INDENTATION_VALUES.includes(indentation)) {
            return false;
          }

          // Get the current selection
          const { selection } = editor.state;
          const { $anchor } = selection;

          // Try to find the closest parent node that's in our list of indentation types
          let foundType: string | undefined = undefined;
          const depth = $anchor.depth;

          // Check if we have BlockWrapper as a parent - prioritize that
          let blockWrapperFound = false;
          for (let d = depth; d > 0; d--) {
            const node = $anchor.node(d);
            if (node.type.name === "blockWrapper") {
              blockWrapperFound = true;
              foundType = "blockWrapper";
              break;
            }
          }

          // If no BlockWrapper, use the node itself
          if (!blockWrapperFound) {
            // First check the current node
            if (this.options.types.includes($anchor.parent.type.name)) {
              foundType = $anchor.parent.type.name;
            } else {
              // Traverse up to find a matching node type
              for (let d = depth; d > 0; d--) {
                const node = $anchor.node(d);
                if (this.options.types.includes(node.type.name)) {
                  foundType = node.type.name;
                  break;
                }
              }
            }
          }

          // If we couldn't find a suitable node, try paragraph as a fallback
          if (!foundType && this.options.types.includes("paragraph")) {
            foundType = "paragraph";
          } else if (!foundType) {
            // If we still don't have a type, just use the first one in our list
            foundType = this.options.types[0];
          }

          // We should always have a foundType at this point
          if (!foundType) {
            return false;
          }

          // Apply indentation to the found type
          return commands.updateAttributes(foundType, { indentation });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-l": () => this.editor.commands.setIndentation("left"),
      "Mod-Shift-e": () => this.editor.commands.setIndentation("center"),
      "Mod-Shift-r": () => this.editor.commands.setIndentation("right"),
    };
  },
});

export default Indentation;
