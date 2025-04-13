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
import { FeaturedImage } from "./FeaturedImage/FeaturedImage";
import { CustomDocument } from "./Document/Document";
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

const nodeExtensions = [FeaturedImage, Heading, Image, BlockWrapper];

const utilityExtensions = [Indentation, SlashCommand];

// Override Document extension with our custom one
const documentExtension = CustomDocument;

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
    },
  });
}

// Get all extensions with optional configuration
export function getAllExtensions(options = {}) {
  return [
    // Custom Document extension
    documentExtension,

    // Core extensions
    ...markExtensions,
    ...nodeExtensions,
    ...utilityExtensions,

    // Custom handlers
    createEmptyParagraphHandler(),
    createImageIndentationExtension(),
  ];
}
