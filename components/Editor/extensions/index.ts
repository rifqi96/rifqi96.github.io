import { Extension } from "@tiptap/core";
import Bold from "./Bold/Bold";
import Italic from "./Italic/Italic";
import Underline from "./Underline/Underline";
import Heading from "./Heading/Heading";
import Image from "./Image/Image";
import Link from "./Link/Link";
import CodeStyle from "./CodeStyle/CodeStyle";
import InlineCodeByBacktick from "./InlineCodeByBacktick";
import SlashCommand from "./SlashCommand/SlashCommand";
import BlockWrapper from "./BlockWrapper/BlockWrapper";
import Indentation from "./Indentation/Indentation";
import { NodeSelection } from "prosemirror-state";
import { Node as ProseMirrorNode } from "prosemirror-model";

// Group extensions by type for better organization
const markExtensions = [
  Bold,
  Italic,
  Underline,
  Link,
  CodeStyle,
  InlineCodeByBacktick,
];

const nodeExtensions = [Heading, Image, BlockWrapper];

const utilityExtensions = [Indentation, SlashCommand];

// Extension to handle empty paragraphs
export function createEmptyParagraphHandler() {
  return Extension.create({
    name: "emptyParagraphHandler",

    addKeyboardShortcuts() {
      return {
        Backspace: ({ editor }) => {
          const { state, view } = editor;
          const { selection, doc } = state;
          const { empty, $head } = selection;

          // Only handle when selection is empty (cursor)
          if (!empty) return false;

          // Check if we're at the start of a paragraph
          if (
            $head.parent.type.name === "paragraph" &&
            $head.parentOffset === 0
          ) {
            // Check if the paragraph is empty or only has whitespace
            const isEmpty = $head.parent.textContent.trim() === "";

            if (isEmpty) {
              // Find out if we're in a blockWrapper
              let inBlockWrapper = false;
              let blockWrapperPos = -1;
              let blockWrapperDepth = 0;

              for (let i = $head.depth; i > 0; i--) {
                const node = $head.node(i);
                if (node.type.name === "blockWrapper") {
                  inBlockWrapper = true;
                  blockWrapperPos = $head.before(i);
                  blockWrapperDepth = i;
                  break;
                }
              }

              if (inBlockWrapper) {
                // If this is the only paragraph in the block wrapper, remove the entire wrapper
                const blockWrapperNode = $head.node(blockWrapperDepth);
                if (blockWrapperNode.content.childCount === 1) {
                  // Delete the entire block wrapper
                  const tr = state.tr.delete(
                    blockWrapperPos,
                    blockWrapperPos + blockWrapperNode.nodeSize,
                  );

                  // If this is the last block in the document, add a new empty block wrapper with paragraph
                  if (doc.content.childCount === 1) {
                    const wrapperType = state.schema.nodes.blockWrapper;
                    const paragraphType = state.schema.nodes.paragraph;

                    if (wrapperType && paragraphType) {
                      tr.insert(
                        0,
                        wrapperType.create(null, paragraphType.create()),
                      );
                    }
                  }

                  view.dispatch(tr);
                  return true;
                } else {
                  // Delete just this paragraph
                  const tr = state.tr.delete(
                    $head.before($head.depth),
                    $head.after($head.depth),
                  );
                  view.dispatch(tr);
                  return true;
                }
              }
            }
          }

          return false;
        },
      };
    },

    // Also add a transaction handler to catch non-keyboard empty paragraph situations
    onTransaction: ({ transaction, editor }) => {
      if (!transaction.docChanged) return;

      // Schedule processing for the next tick to ensure current transaction completes
      setTimeout(() => {
        const { state, view } = editor;
        const { doc, schema } = state;
        let tr = state.tr;
        let changed = false;

        // Find all empty paragraphs that are direct children of blockWrappers
        // and where siblings exist (not solo paragraphs)
        doc.descendants((node, pos, parent) => {
          if (
            node.type.name === "paragraph" &&
            node.textContent.trim() === "" &&
            parent &&
            parent.type.name === "blockWrapper" &&
            parent.content.childCount > 1
          ) {
            // Skip paragraphs with cursor in them
            const $pos = state.doc.resolve(pos);
            let hasCursor = false;

            if (
              state.selection.$from.pos >= pos &&
              state.selection.$from.pos <= pos + node.nodeSize
            ) {
              hasCursor = true;
            }

            if (!hasCursor) {
              // Remove the empty paragraph
              tr = tr.delete(pos, pos + node.nodeSize);
              changed = true;
            }

            return false; // Don't descend into paragraphs
          }

          return true;
        });

        // Apply changes if any were made
        if (changed) {
          view.dispatch(tr);
        }
      }, 0);
    },
  });
}

// Extension to handle block wrapping
export function createBlockWrapperExtension() {
  return Extension.create({
    name: "autoBlockWrapper",
    // Add an onTransaction handler that runs after each state change
    onTransaction: ({ transaction, editor }) => {
      // Only run if doc content changed
      if (!transaction.docChanged) return;

      // Schedule the check for the next tick to ensure the current transaction completes
      setTimeout(() => {
        // Find all top-level blocks that need wrapping
        const { doc, schema } = editor.state;
        const blockTypes = ["paragraph", "heading", "image"];
        const wrapperType = schema.nodes.blockWrapper;

        if (!wrapperType) return;

        // Collect nodes that should be wrapped
        const nodesToWrap: { node: ProseMirrorNode; pos: number }[] = [];

        doc.descendants((node, pos, parent) => {
          // Only consider block nodes that are at the top level (doc)
          if (blockTypes.includes(node.type.name) && parent === doc) {
            // Check if they're directly in the doc (not in a blockWrapper)
            nodesToWrap.push({ node, pos });
          }

          // Don't descend into blockWrappers
          return node.type.name !== "blockWrapper";
        });

        // If we found nodes to wrap, apply the wrapping
        if (nodesToWrap.length > 0) {
          // Create a new transaction
          const { state, view } = editor;
          const tr = state.tr;

          // Then use commands to wrap each node
          nodesToWrap.forEach(({ node, pos }) => {
            editor.chain().setNodeSelection(pos).wrapInBlockWrapper().run();
          });
        }
      }, 0);
    },
    // Add keydown handler to handle Enter key to create new block wrapper
    addKeyboardShortcuts() {
      return {
        Enter: ({ editor }) => {
          const { state, view } = editor;
          const { schema, selection, doc } = state;
          const { $from, $to } = selection;

          // Find if we're inside a blockWrapper
          let inBlockWrapper = false;
          let blockWrapperPos = -1;
          let blockWrapperNode: ProseMirrorNode | null = null;
          let blockWrapperDepth = 0;

          for (let i = $from.depth; i > 0; i--) {
            const node = $from.node(i);
            if (node.type.name === "blockWrapper") {
              inBlockWrapper = true;
              blockWrapperPos = $from.before(i);
              blockWrapperNode = node;
              blockWrapperDepth = i;
              break;
            }
          }

          // If we're in a blockWrapper, handle the split directly
          if (inBlockWrapper) {
            // 1. Delete any selection first
            const tr = state.tr.delete($from.pos, $to.pos);
            view.dispatch(tr);

            // 2. Get the current cursor position
            const cursor = state.selection.from;

            // 3. Don't split the paragraph, instead directly create a new wrapper
            setTimeout(() => {
              // Create a new wrapper with paragraph
              const { state, view } = editor;
              const { selection, doc } = state;
              const { from } = selection;

              // Find the position after the current wrapper
              // to insert the new block wrapper
              let currentBlockWrapperEnd = 0;
              doc.descendants((node, pos) => {
                if (pos < blockWrapperPos) return true;
                if (
                  node.type.name === "blockWrapper" &&
                  pos === blockWrapperPos
                ) {
                  currentBlockWrapperEnd = pos + node.nodeSize;
                  return false;
                }
                return true;
              });

              // Insert a new empty paragraph in a new wrapper
              const insertTr = state.tr.insert(
                currentBlockWrapperEnd,
                schema.nodes.blockWrapper.create(
                  null,
                  schema.nodes.paragraph.create(),
                ),
              );
              view.dispatch(insertTr);

              // Set selection to the start of the new wrapper
              editor.commands.setTextSelection(currentBlockWrapperEnd + 2);
            }, 0);

            return true; // We handled the Enter key
          }

          // If not in a blockWrapper, let the default behavior happen,
          // and our onTransaction handler will wrap any new paragraphs
          return false;
        },
      };
    },
  });
}

// Extension to handle image indentation
export function createImageIndentationExtension() {
  return Extension.create({
    name: "imageIndentation",
    // Run after Indentation extension processes the document
    priority: 100,

    // Add specific attributes to image nodes for indentation
    addGlobalAttributes() {
      return [
        {
          types: ["image"],
          attributes: {
            indentation: {
              default: "left",
              renderHTML: (attributes) => {
                return {
                  "data-indentation": attributes.indentation,
                };
              },
              parseHTML: (element) =>
                element.getAttribute("data-indentation") || "left",
            },
          },
        },
      ];
    },

    // Apply indentation attributes to images when blockWrapper changes
    onTransaction: ({ transaction, editor }) => {
      if (!transaction.docChanged) return;

      // Process in next tick to allow other extensions to complete
      setTimeout(() => {
        const { state, view } = editor;
        const { doc } = state;

        // Find all image nodes
        doc.descendants((node, pos) => {
          if (node.type.name === "image") {
            // Check if the parent blockWrapper has indentation
            const $pos = state.doc.resolve(pos);
            let parentIndentation = "left"; // Default

            // Check up the tree for indentation attributes
            for (let i = $pos.depth; i > 0; i--) {
              const parentNode = $pos.node(i);
              if (parentNode.attrs && parentNode.attrs.indentation) {
                parentIndentation = parentNode.attrs.indentation;
                break;
              }
            }

            // If image indentation doesn't match parent, update it
            if (node.attrs.indentation !== parentIndentation) {
              const tr = state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indentation: parentIndentation,
              });
              view.dispatch(tr);
            }
          }
          return true;
        });
      }, 0);
    },
  });
}

// Get all extensions with optional configuration
export function getAllExtensions(options = {}) {
  const extensions = [
    ...markExtensions,
    ...nodeExtensions,
    ...utilityExtensions,
    createBlockWrapperExtension(),
    createImageIndentationExtension(),
    createEmptyParagraphHandler(),
  ];

  // Apply any custom options to extensions
  return extensions.map((extension) => {
    const extensionName = extension.name;
    if (options[extensionName]) {
      return extension.configure(options[extensionName]);
    }
    return extension;
  });
}
