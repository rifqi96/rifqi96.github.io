import {
  Node,
  mergeAttributes,
  type KeyboardShortcutCommand,
} from "@tiptap/core";
import { NodeSelection } from "prosemirror-state";
import { Node as ProseMirrorNode } from "prosemirror-model";
import { findSelectedNode } from "../../utils/tiptap.util";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockWrapper: {
      /**
       * Hit enter to create a new paragraph. If the cursor position is at the middle of a paragraph, split the paragraph.
       *
       * @param pos - The position of the cursor
       * @returns - The result of the command
       */
      addOrSplitParagraph: () => ReturnType; // No longer needs pos

      /**
       * Insert a block wrapper at the cursor position
       *
       * @param pos - The position of the cursor
       * @returns - The result of the command
       */
      insertBlockWrapper: (pos: number) => ReturnType;

      /**
       * Insert a block wrapper below the cursor position
       *
       * @param pos - Optional position to find the block wrapper
       * @returns - The result of the command
       */
      insertBlockWrapperBelow: (pos?: number) => ReturnType;

      /**
       * Insert a block wrapper above the cursor position
       *
       * @param pos - Optional position to find the block wrapper
       * @returns - The result of the command
       */
      insertBlockWrapperAbove: (pos?: number) => ReturnType;

      /**
       * Wrap a block in a block wrapper
       *
       * @returns - The result of the command
       */
      wrapInBlockWrapper: () => ReturnType;
      /**
       * Set the indentation of a block wrapper
       *
       * @param indentation - The indentation of the block wrapper
       * @returns - The result of the command
       */
      setBlockWrapperIndentation: (indentation: string) => ReturnType;
      /**
       * Move a blockWrapper up
       *
       * @returns - The result of the command
       */
      moveBlockWrapperUp: () => ReturnType;

      /**
       * Move a blockWrapper down
       *
       * @returns - The result of the command
       */
      moveBlockWrapperDown: () => ReturnType;
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

  // Helper functions
  addOptions() {
    return {
      ...this.parent?.(),
      findSelectedBlockWrapper: (selection) => {
        const { $from } = selection;

        // Find the closest blockWrapper node
        for (let i = $from.depth; i > 0; i--) {
          const node = $from.node(i);
          if (node.type.name === "blockWrapper") {
            return {
              node,
              pos: $from.before(i),
              start: $from.before(i),
              end: $from.after(i),
              depth: i,
            };
          }
        }
        return null;
      },
    };
  },

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

  // Add commands to create and manipulate block wrappers
  addCommands() {
    return {
      addOrSplitParagraph:
        () =>
        // No longer needs pos argument
        ({ chain, editor }) => {
          // Use Tiptap's built-in splitBlock command
          // It handles splitting at start, middle, end, and empty paragraphs correctly.
          // It will split the current block (expected to be paragraph within blockWrapper)
          // and insert a new default block (paragraph) after it.
          return chain().splitBlock().run();
        },

      insertBlockWrapper:
        (pos: number) =>
        ({ editor, chain }) => {
          // create a new block wrapper node
          return chain()
            .insertContentAt(pos, {
              type: this.name,
              content: [
                {
                  type: "paragraph",
                },
              ],
            })
            .run();
        },

      insertBlockWrapperAbove:
        (pos?: number) =>
        ({ editor, chain }) => {
          const blockWrapper = findSelectedNode(
            editor,
            (node) => node.type.name === "blockWrapper",
            pos ? { pos } : undefined,
          );
          // bail if a block wrapper node couldn't be found
          if (!blockWrapper) {
            return false;
          }
          // create a new block wrapper node
          return chain().insertBlockWrapper(blockWrapper.start).run();
        },

      insertBlockWrapperBelow:
        (pos?: number) =>
        ({ editor, chain }) => {
          const blockWrapper = findSelectedNode(
            editor,
            (node) => node.type.name === "blockWrapper",
            pos ? { pos } : undefined,
          );
          // bail if a block wrapper node couldn't be found
          if (!blockWrapper) {
            return false;
          }
          // create a new block wrapper node
          return chain().insertBlockWrapper(blockWrapper.end).run();
        },

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

  // Add keyboard shortcuts
  addKeyboardShortcuts() {
    return {
      /**
       * Hit enter to create a new paragraph. If the cursor position is at the middle of a paragraph, split the paragraph.
       */
      Enter: ({ editor }) => {
        const { selection } = editor.state;
        const { from, to } = selection;

        // Do nothing if this node is a descendant of a node that should be ignored
        const ignoreNodeTypes = ["header"];
        for (const type of ignoreNodeTypes) {
          if (findSelectedNode(editor, (node) => node.type.name === type)) {
            return false; // Let default Enter handling occur (or other extension)
          }
        }

        // Delegate to insertBlockWrapperBelow for specific parent types
        const exceptionNodeTypes = ["caption", "listItem"];
        for (const type of exceptionNodeTypes) {
          if (findSelectedNode(editor, (node) => node.type.name === type)) {
            // Use 'from' which represents the cursor position before potential deletion
            return editor.chain().insertBlockWrapperBelow(from).run();
          }
        }

        // Delete current selection if any (standard Enter behavior)
        if (from !== to) {
          editor.commands.deleteSelection();
          // Note: We don't need to update 'from' as splitBlock works on the current selection
        }

        // Use the simplified addOrSplitParagraph which now just calls splitBlock
        // Pass focus to ensure the editor remains focused after the operation
        return editor.chain().focus().addOrSplitParagraph().run();
      },
    };
  },

  // Ensure unwrapped blocks get wrapped
  // onTransaction({ transaction, editor }) {
  //   // Only run if doc content changed
  //   if (!transaction.docChanged) return;

  //   const { doc, schema } = editor.state;
  //   const blockTypes = ["paragraph", "heading", "image"];
  //   const wrapperType = schema.nodes.blockWrapper;

  //   if (!wrapperType) return;

  //   // Collect nodes that need wrapping
  //   const nodesToWrap: { node: ProseMirrorNode; pos: number }[] = [];

  //   // Find all top-level blocks that need to be wrapped
  //   doc.descendants((node, pos, parent) => {
  //     // Only consider block nodes that are directly inside the document (not in blockWrappers)
  //     if (
  //       blockTypes.includes(node.type.name) &&
  //       parent &&
  //       parent.type.name === "doc"
  //     ) {
  //       nodesToWrap.push({ node, pos });
  //     }

  //     // Don't descend into blockWrappers to avoid nested wrappers
  //     return node.type.name !== "blockWrapper";
  //   });

  //   // If we found nodes to wrap, apply the wrapping
  //   if (nodesToWrap.length > 0) {
  //     // Handle each unwrapped node
  //     nodesToWrap.forEach(({ node, pos }) => {
  //       editor.chain().setNodeSelection(pos).wrapInBlockWrapper().run();
  //     });
  //   }
  // },
});

export default BlockWrapper;
