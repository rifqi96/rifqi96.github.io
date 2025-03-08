import { Mark } from "@tiptap/vue-3";

const Bold = Mark.create({
  name: "bold",
  addOptions() {
    return {
      HTMLAttributes: {
        class: "bold",
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "strong",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["strong", HTMLAttributes, 0];
  },
});

export default Bold;
