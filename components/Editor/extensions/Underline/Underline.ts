import { Mark } from "@tiptap/vue-3";

const Underline = Mark.create({
  name: "underline",
  addOptions() {
    return {
      HTMLAttributes: {
        class: "underline",
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "u",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["u", HTMLAttributes, 0];
  },
});

export default Underline;
