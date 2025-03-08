import { Heading as TiptapHeading } from "@tiptap/extension-heading";

const Heading = TiptapHeading.extend({
  addOptions() {
    return {
      levels: [...[1, 2, 3]] as [1, 2, 3],
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: (element) => {
          return element.getAttribute("class");
        },
        renderHTML: (attributes) => {
          return {
            class: attributes.class,
          };
        },
      },
    };
  },
});

export default Heading;
