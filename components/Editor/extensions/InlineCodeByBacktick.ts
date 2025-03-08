import { Mark, mergeAttributes, markInputRule } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    inlineCodeByBacktick: {
      /**
       * Toggle a code style with backticks
       */
      toggleCodeStyleByBacktick: () => ReturnType;
    };
  }
}

const InlineCodeByBacktick = Mark.create({
  name: "inlineCodeByBacktick",

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
      toggleCodeStyleByBacktick:
        () =>
        ({ commands, editor }) => {
          return commands.toggleMark("codeStyle");
        },
    };
  },

  addInputRules() {
    return [
      markInputRule({
        find: /(?<=^|\s)`(?=\S)([^`]+?)(?<=\S)`(?=\s|$)/,
        type: this.editor.schema.marks.codeStyle,
        getAttributes: (match) => ({ class: "code-style" }),
      }),
    ];
  },
});

export default InlineCodeByBacktick;
