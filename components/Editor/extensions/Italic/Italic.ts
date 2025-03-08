import { Mark } from "@tiptap/vue-3";

const Italic = Mark.create({
  name: "italic",
  addOptions() {
    return {
      HTMLAttributes: {
        class: "italic",
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "em",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["em", HTMLAttributes, 0];
  },
});

export default Italic;
