import { Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    codeStyle: {
      /**
       * Toggle a code style
       */
      toggleCodeStyle: () => ReturnType;
    };
  }
}

const CodeStyle = Mark.create({
  name: "codeStyle",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "code-style",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "code",
        getAttrs: (node) => ({ class: "code-style" }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "code",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      toggleCodeStyle:
        () =>
        ({ commands, editor }) => {
          return commands.toggleMark(this.name, this.options.HTMLAttributes);
        },
    };
  },
  addKeyboardShortcuts() {
    return {
      "mod-`": () => this.editor.commands.toggleCodeStyle(),
      ArrowRight: () => {
        const { state } = this.editor.view;
        const { from, to } = state.selection;
        if (from === to) {
          const codeMark = state.schema.marks.codeStyle;
          if (
            state.selection.$from.marks().some((mark) => mark.type === codeMark)
          ) {
            return this.editor.commands.unsetMark("codeStyle");
          }
        }
        return false;
      },
    };
  },
});

export default CodeStyle;
