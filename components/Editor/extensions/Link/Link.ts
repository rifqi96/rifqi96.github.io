import { Link as TiptapLink } from "@tiptap/extension-link";

const Link = TiptapLink.extend({
  addOptions() {
    return {
      openOnClick: false,
      autolink: true,
      protocols: ["https", "http", "mailto"],
      defaultProtocol: "https",
      linkOnPaste: true,
      validate: (url: string) => {
        // Accept any non-empty URL
        return !!url;
      },
      isAllowedUri: () => true,
      shouldAutoLink: () => true,
      HTMLAttributes: {
        class: "link",
        target: "_blank",
        rel: "noopener noreferrer nofollow",
      },
    };
  },
  addCommands() {
    return {
      ...this.parent?.(),

      // Enhanced setLink command that can handle text + link combined
      setTextWithLink:
        (attributes) =>
        ({ chain, commands }) => {
          // If there's already text selected, just set the link
          if (!commands.selection.isCollapsed()) {
            return chain().setLink(attributes).run();
          }

          // If no text is selected and we have text to add, insert it with a link
          if (attributes.text) {
            return chain()
              .insertContent({
                type: "text",
                text: attributes.text,
                marks: [
                  {
                    type: this.name,
                    attrs: {
                      href: attributes.href,
                    },
                  },
                ],
              })
              .run();
          }

          return false;
        },
    };
  },
});

export default Link;
