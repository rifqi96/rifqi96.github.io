import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockWrapper: {
      /**
       * Wrap a block in a block wrapper
       */
      wrapInBlockWrapper: () => ReturnType;
      /**
       * Set the indentation of a block wrapper
       */
      setBlockWrapperIndentation: (indentation: string) => ReturnType;
    };
  }
}

export const BlockWrapper = Node.create({
  name: "blockWrapper",

  // This extension should come before other extensions that define block nodes
  priority: 1000,

  // Specify which nodes this wrapper can contain
  content: "block+",

  group: "block",

  // Make it a top level node
  defining: true,

  // Add custom attributes for the wrapper
  addAttributes() {
    return {
      // Support indentation at the wrapper level
      indentation: {
        default: "left",
        parseHTML: (element) => {
          return element.getAttribute("data-indentation") || "left";
        },
        renderHTML: (attributes) => {
          return {
            "data-indentation": attributes.indentation || "left",
          };
        },
      },
      className: {
        default: null,
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          if (!attributes.className) {
            return {};
          }

          return {
            class: attributes.className,
          };
        },
      },
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) {
            return {};
          }

          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
      padding: {
        default: null,
        parseHTML: (element) => element.style.padding,
        renderHTML: (attributes) => {
          if (!attributes.padding) {
            return {};
          }

          return {
            style: `padding: ${attributes.padding}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-type='block-wrapper']",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "block-wrapper" }, HTMLAttributes),
      0, // content placeholder
    ];
  },

  // Add commands to create block wrappers
  addCommands() {
    return {
      wrapInBlockWrapper:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name);
        },

      setBlockWrapperIndentation:
        (indentation) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { indentation });
        },
    };
  },
});

export default BlockWrapper;
