import { NodeSelection } from "prosemirror-state";

export function useImageIndentation(editor: any) {
  // Function to set image indentation
  function setImageIndentation(alignment: "left" | "center" | "right") {
    if (!editor.value) return false;

    const { state } = editor.value;
    const { selection, doc } = state;

    // Create a single transaction for all changes
    let tr = state.tr;
    let updated = false;

    // Check if we already have a NodeSelection for an image
    if (
      selection instanceof NodeSelection &&
      selection.node.type.name === "image"
    ) {
      // Apply indentation to the directly selected image
      tr = tr.setNodeMarkup(selection.from, undefined, {
        ...selection.node.attrs,
        indentation: alignment,
      });
      updated = true;

      // Find the parent blockWrapper if it exists
      const $pos = state.doc.resolve(selection.from);
      for (let i = $pos.depth; i > 0; i--) {
        const node = $pos.node(i);
        const pos = $pos.before(i);

        if (node.type.name === "blockWrapper") {
          // Add the blockWrapper update to the same transaction
          tr = tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            indentation: alignment,
          });
          break;
        }
      }
    } else {
      // If we don't have a direct NodeSelection, search between selection boundaries
      const { from, to } = selection;

      doc.nodesBetween(from, to, (node, pos) => {
        if (node.type.name === "image") {
          // Apply indentation directly to the image in the same transaction
          tr = tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            indentation: alignment,
          });
          updated = true;

          // Also find and update the parent blockWrapper if it exists
          const $pos = tr.doc.resolve(pos);
          for (let i = $pos.depth; i > 0; i--) {
            const parentNode = $pos.node(i);
            const parentPos = $pos.before(i);

            if (parentNode.type.name === "blockWrapper") {
              // Add to the same transaction
              tr = tr.setNodeMarkup(parentPos, undefined, {
                ...parentNode.attrs,
                indentation: alignment,
              });
              break;
            }
          }

          return false; // Stop searching
        }
        return true;
      });
    }

    // If we found and updated an image, dispatch the transaction with all changes
    if (updated) {
      editor.value.view.dispatch(tr);

      // Force refresh the editor after a short delay
      setTimeout(() => {
        editor.value?.commands.focus();
      }, 10);
      return true;
    } else {
      // Apply indentation to regular paragraph or other block
      return editor.value.chain().focus().setIndentation(alignment).run();
    }
  }

  return {
    setImageIndentation,
  };
}
