import { ref, watch } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import { Extension } from "@tiptap/core";
import { TextSelection } from "prosemirror-state";

export function useEditorConfig(options: {
  initialContent?: string;
  onUpdate?: (content: string, contentBlocks: any[]) => void;
  extensions?: any[];
}) {
  const { initialContent = "", onUpdate, extensions = [] } = options;

  // Process editor content to structured blocks for easier querying
  function processEditorContentToBlocks(content: string): any[] {
    // Very simplified approach - you might want to use an HTML parser
    const blocks: any[] = [];

    // Placeholder implementation - actual parsing logic would depend on your content structure
    return blocks;
  }

  // Debounce helper to trigger savePost after a pause in editing ("on bounce")
  function debounce(fn: () => void, delay: number) {
    let timer: ReturnType<typeof setTimeout>;
    return () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn();
      }, delay);
    };
  }

  // Create the editor instance with default and custom extensions
  const editor = useEditor({
    content: initialContent,
    extensions: [
      // Configure StarterKit
      StarterKit.configure({
        heading: false, // Disable default heading to use our custom one
        paragraph: {
          HTMLAttributes: {
            class: "editor-paragraph",
          },
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Highlight,
      Typography,
      // Use Placeholder extension with standard configuration
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "paragraph") {
            return "Start writing or type '/' for more commands...";
          }
          return "";
        },
        showOnlyWhenEditable: true,
        showOnlyCurrent: true, // Only show placeholder on the current node
        includeChildren: true,
      }),
      // Add custom extension to enhance placeholder visibility only on focus
      Extension.create({
        name: "enhancedPlaceholder",

        addOptions() {
          return {
            editorHasFocusClass: "has-focus",
          };
        },

        // Add a custom class to the editor when it receives focus
        onFocus() {
          const editorElement = document.querySelector(".tiptap");
          if (editorElement) {
            editorElement.classList.add("has-focus");
          }
          return false;
        },

        onBlur() {
          const editorElement = document.querySelector(".tiptap");
          if (editorElement) {
            editorElement.classList.remove("has-focus");
          }
          return false;
        },
      }),
      // Add custom extension for Cmd+A selection of current line only
      Extension.create({
        name: "lineSelection",
        addKeyboardShortcuts() {
          return {
            "Mod-a": ({ editor }) => {
              const { state, view } = editor;
              const { selection } = state;
              const { $from } = selection;

              // Find the start of the line
              const lineStart = $from.start();

              // Find the end of the line
              const lineEnd = $from.end();

              // Create a new selection for just this line
              const tr = state.tr.setSelection(
                TextSelection.create(state.doc, lineStart, lineEnd),
              );

              // Apply the transaction
              view.dispatch(tr);
              return true;
            },
          };
        },
      }),
      // Add custom extension to save on update
      Extension.create({
        name: "saveOnUpdate",
        onUpdate: debounce(() => {
          if (editor.value && onUpdate) {
            const content = editor.value.getHTML();
            const contentBlocks = processEditorContentToBlocks(content);
            onUpdate(content, contentBlocks);
          }
        }, 1000),
      }),
      // Include all custom extensions passed from the parent component
      ...extensions,
    ],
  });

  return {
    editor,
    processEditorContentToBlocks,
  };
}
