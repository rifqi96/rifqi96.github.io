import { Extension } from "@tiptap/core";
import Suggestion, {
  type SuggestionOptions,
  type SuggestionKeyDownProps,
} from "@tiptap/suggestion";

export interface SlashCommandItem {
  title: string;
  description?: string;
  icon?: string;
  command: ({ editor, range }: { editor: any; range: any }) => void;
}

const createImageUploadEvent = () => {
  return new CustomEvent("tiptap-image-upload", {
    bubbles: true,
    detail: { source: "slash-command" },
  });
};

const createImageDialogEvent = () => {
  return new CustomEvent("tiptap-image-dialog", {
    bubbles: true,
    detail: { source: "slash-command" },
  });
};

export interface SlashCommandOptions {
  suggestion: Omit<SuggestionOptions, "editor">;
}

const defaultItems = [
  {
    title: "Image",
    description: "Upload an image",
    icon: "🖼️",
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor.chain().focus().deleteRange(range).run();
      // Dispatch event to show the image upload dialog
      const customEvent = createImageDialogEvent();
      editor.view.dom.dispatchEvent(customEvent);
    },
  },
  {
    title: "Heading 1",
    description: "Large heading",
    icon: "H1",
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium heading",
    icon: "H2",
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small heading",
    icon: "H3",
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a bullet list",
    icon: "•",
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    icon: "1.",
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Code Block",
    description: "Add a code block",
    icon: "</>",
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Blockquote",
    description: "Add a quote",
    icon: "❝",
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
];

const defaultSuggestion: Omit<SuggestionOptions, "editor"> = {
  char: "/",
  startOfLine: true,
  allowSpaces: true,
  command: ({
    editor,
    range,
    props,
  }: {
    editor: any;
    range: any;
    props: any;
  }) => {
    // Execute the command of the selected item
    if (props && typeof props.command === "function") {
      // Execute the command with proper parameters
      if (props && typeof props.command === "function") {
        // Execute the command with proper parameters
        props.command({ editor, range });
      }
    }
  },
  items: ({ query }: { query: string }) => {
    if (!query) {
      return defaultItems;
    }

    return defaultItems.filter((item) => {
      return (
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      );
    });
  },
  render: () => {
    let popup: HTMLElement;
    let selectedIndex = 0;
    let items: SlashCommandItem[] = [];

    const createPopup = () => {
      popup = document.createElement("div");
      popup.className = "slash-command-menu";
      popup.style.position = "absolute";
      popup.style.backgroundColor = "#fff";
      popup.style.boxShadow =
        "0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 10px rgba(0, 0, 0, 0.1)";
      popup.style.borderRadius = "6px";
      popup.style.padding = "8px 0";
      popup.style.zIndex = "1000";
      popup.style.maxHeight = "300px";
      popup.style.overflowY = "auto";
      popup.style.width = "280px";
      document.body.appendChild(popup);
      return popup;
    };

    const renderItems = () => {
      if (!popup) return;

      popup.innerHTML = "";

      items.forEach((item, index) => {
        const itemElement = document.createElement("div");
        itemElement.className = "slash-command-item";
        itemElement.style.padding = "8px 14px";
        itemElement.style.display = "flex";
        itemElement.style.alignItems = "center";
        itemElement.style.cursor = "pointer";
        itemElement.style.borderLeft =
          index === selectedIndex
            ? "2px solid #0d6efd"
            : "2px solid transparent";
        itemElement.style.backgroundColor =
          index === selectedIndex ? "rgba(13, 110, 253, 0.1)" : "transparent";
        itemElement.style.transition = "background-color 0.2s";

        // Icon
        const iconElement = document.createElement("div");
        iconElement.className = "slash-command-item-icon";
        iconElement.style.width = "24px";
        iconElement.style.height = "24px";
        iconElement.style.display = "flex";
        iconElement.style.alignItems = "center";
        iconElement.style.justifyContent = "center";
        iconElement.style.marginRight = "12px";
        iconElement.style.fontSize = "14px";
        iconElement.style.backgroundColor = "#f2f2f2";
        iconElement.style.borderRadius = "4px";
        iconElement.textContent = item.icon || "";
        itemElement.appendChild(iconElement);

        // Content (title and description)
        const contentElement = document.createElement("div");
        contentElement.className = "slash-command-item-content";
        contentElement.style.flex = "1";
        contentElement.style.display = "flex";
        contentElement.style.flexDirection = "column";

        // Title
        const titleElement = document.createElement("div");
        titleElement.className = "slash-command-item-title";
        titleElement.style.fontWeight = "500";
        titleElement.style.fontSize = "14px";
        titleElement.textContent = item.title;
        contentElement.appendChild(titleElement);

        // Description
        if (item.description) {
          const descriptionElement = document.createElement("div");
          descriptionElement.className = "slash-command-item-description";
          descriptionElement.style.fontSize = "12px";
          descriptionElement.style.color = "#777";
          descriptionElement.style.marginTop = "2px";
          descriptionElement.textContent = item.description;
          contentElement.appendChild(descriptionElement);
        }

        itemElement.appendChild(contentElement);

        // Add click event to execute command
        itemElement.addEventListener("click", () => {
          if (props && props.command && item) {
            // This is the correct way to call the command with the selected item
            props.command(item);
          }
          popup.remove();
        });

        popup.appendChild(itemElement);
      });
    };

    let props: any;

    return {
      onStart: (p) => {
        props = p;
        items = props.items;
        selectedIndex = 0;

        createPopup();
        renderItems();

        const rect =
          typeof props.clientRect === "function"
            ? props.clientRect()
            : props.clientRect;

        if (rect) {
          popup.style.top = `${rect.top + window.scrollY + 24}px`;
          popup.style.left = `${rect.left + window.scrollX}px`;
        }
      },

      onUpdate: (p) => {
        props = p;
        items = props.items;

        renderItems();

        const rect =
          typeof props.clientRect === "function"
            ? props.clientRect()
            : props.clientRect;

        if (rect) {
          popup.style.top = `${rect.top + window.scrollY + 24}px`;
          popup.style.left = `${rect.left + window.scrollX}px`;
        }
      },

      onKeyDown: ({ event }) => {
        if (event.key === "Escape") {
          popup.remove();
          return true;
        }

        if (!items || items.length === 0) {
          return false;
        }

        // Handle arrow up
        if (event.key === "ArrowUp") {
          event.preventDefault();
          selectedIndex = (selectedIndex - 1 + items.length) % items.length;
          renderItems();
          return true;
        }

        // Handle arrow down
        if (event.key === "ArrowDown") {
          event.preventDefault();
          selectedIndex = (selectedIndex + 1) % items.length;
          renderItems();
          return true;
        }

        // Handle enter
        if (event.key === "Enter") {
          // Check if an item is selected
          if (items[selectedIndex]) {
            const selectedItem = items[selectedIndex];

            // Check if the selected item has a command function and props are available
            if (
              selectedItem &&
              typeof selectedItem.command === "function" &&
              props
            ) {
              // Execute the command
              selectedItem.command({
                editor: props.editor,
                range: props.range,
              });

              // Stop event propagation *after* command execution
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation();
              popup.remove(); // Close the popup
              return true; // Indicate event handled
            } else {
              // Handle case where item exists but command is invalid/missing props
              // Still prevent default action (like newline) and close popup
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation();
              popup.remove();
              return true;
            }
          } else {
            // Fallback: No item selected, but Enter was pressed.
            // Prevent default action (newline) and stop propagation.
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            popup.remove(); // Close the popup
            return true; // Indicate event handled
          }

          // Fallback if no item selected? Maybe just close popup.
          popup.remove();
          return true; // Still prevent default even if no item action taken
        }

        return false;
      },

      onExit: () => {
        if (popup) {
          popup.remove();
        }
      },
    };
  },
};

const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: defaultSuggestion,
    };
  },

  priority: 200,

  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
  },
});

export default SlashCommand;
