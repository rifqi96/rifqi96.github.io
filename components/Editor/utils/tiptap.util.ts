import type { Editor as TiptapCoreEditor, JSONContent } from "@tiptap/core";
import type { Editor as TiptapVueEditor } from "@tiptap/vue-3";
import type { Node } from "@tiptap/pm/model";
import type { MaybeRefOrGetter } from "vue";
import { EditorState } from "@tiptap/pm/state";

type Editor = TiptapCoreEditor | TiptapVueEditor;

type ConvertedContentBlockData = {
  text: string;
  source: string;
  node?: JSONContent;
};

export function getEditorSelection(
  editor: MaybeRefOrGetter<Editor | undefined>,
) {
  editor = toValue(editor);
  if (!editor) return null;
  return editor.view.state.selection;
}

export function getSelectedText(
  editor?: MaybeRefOrGetter<Editor | undefined>,
): string {
  editor = toValue(editor);
  if (!editor) return "";
  const { view, state } = editor;
  const { from, to } = view.state.selection;
  return state.doc.textBetween(from, to, "");
}

/**
 * Returns an array of nodes that match the given predicate.
 * This should be used as a last resort, as it traverses all nodes in the document tree.
 * If you already have a node selected, use `findSelectedNode` instead.
 *
 * @param editor the editor instance (can be a ref)
 * @param predicate a function that returns true if the node matches the desired criteria
 * @param options {
 *   limit: the maximum number of nodes to return, will short-circuit the traversal if reached
 * }
 */
export function findNodes(
  editor: MaybeRefOrGetter<Editor | undefined>,
  predicate: (node: Node) => boolean,
  options: { limit?: number } = {},
): Array<{
  node: Node;
  position: number;
}> {
  editor = toValue(editor);
  if (!editor) return [];
  const { doc } = editor.state;
  const nodes: Array<{
    node: Node;
    position: number;
  }> = [];
  doc.descendants((node, offset) => {
    // Short-circuit if we've reached the limit
    if (options.limit && nodes.length >= options.limit) {
      return false;
    }
    if (predicate(node)) {
      nodes.push({
        node,
        position: offset,
      });
    }
  });
  return nodes;
}

/**
 * Functionally equivalent to findNodes, but returns the first node found or null instead of an array.
 */
export function findNode(
  editor: MaybeRefOrGetter<Editor | undefined>,
  predicate: (node: Node) => boolean,
): { node: Node; position: number } | null {
  return findNodes(editor, predicate, { limit: 1 })[0] ?? null;
}

/**
 * Walks up the document tree from the current selected node to find the first ancestor node that has the given type.
 * Returns the node and other useful information about it.
 * Returns null if no matching node is found.
 *
 * @param editor the TipTap editor instance
 * @param options {
 *   type: the TipTap type name of the node to find
 *   pos: the position to start the search from, defaults to the current selection anchor
 * }
 */
export function findSelectedNode(
  editor:
    | MaybeRefOrGetter<Editor | undefined>
    | MaybeRefOrGetter<EditorState | undefined>,
  predicate: (node: Node) => boolean,
  options?: { pos?: number },
): null | {
  node: Node;
  start: number;
  end: number;
  nodeBefore: Node | null;
  nodeAfter: Node | null;
  isOnlyNodeSelected: boolean;
  isSelected: boolean;
  text: string;
} {
  editor = toValue(editor);
  if (!editor) {
    return null;
  }
  const { doc, selection } =
    editor instanceof EditorState ? editor : editor.state;
  const { anchor, from, to } = selection;

  const pos = options?.pos ?? from;
  const resolvedPos = doc.resolve(pos);
  let node = doc.nodeAt(pos);
  let depth = resolvedPos.depth + 1; // pos.node(pos.depth) is the parent of the selected node

  // traverse the path along [doc] -> ... [contentBlock node] -> ... -> [selected node]
  // to find the deepest content block node ^
  // we must not assume that the parent of the selected node is a content block node,
  // or that there is only one content block node in the path
  if (!node || !predicate(node)) {
    while (depth > 0) {
      depth--;
      if (predicate(resolvedPos.node(depth))) {
        break;
      }
    }
    node = resolvedPos.node(depth);
  }

  // get content block node, bail if not found
  if (!node || !predicate(node)) {
    return null;
  }

  // get start and end positions of content block node
  const start = depth === 0 ? 0 : resolvedPos.before(depth);
  const nodeSize = node.isText ? to - from : node.nodeSize; // if text node, use the selection size, else use node size
  const end =
    depth === 0
      ? doc.content.size
      : depth === resolvedPos.depth + 1
        ? resolvedPos.after(depth) + nodeSize
        : resolvedPos.after(depth);

  // get sibling nodes before and after
  const nodeBefore = doc.resolve(start).nodeBefore;
  const nodeAfter = doc.resolve(end).nodeAfter;

  // determine selection properties
  const isOnlyNodeSelected = from > start && to < end;
  const isSelected =
    (from >= start && to <= end) ||
    (to > start && to < end) ||
    (from > start && from < end);

  // get text
  const text = doc.textBetween(start, end, "");

  return {
    node,
    start,
    end,
    nodeBefore,
    nodeAfter,
    isOnlyNodeSelected,
    isSelected,
    text,
  };
}

export function stringifyDocumentStructure(
  doc?: Node,
  tabs1: string = " ",
  tabs2: string = " ", // fibonacci tabs are unironically more readable
  offset: number = 0,
): string {
  const tick = performance.now();
  doc = toValue(doc);
  if (!doc) return "";
  const tabs = `${tabs1}${tabs2}`;
  const range = `{ start: ${offset - 1}, end: ${offset + doc.nodeSize - 1} }`;

  if (doc.type.name === "text" && doc.text) {
    let preview = doc.text.slice(0, 50);
    if (doc.text.length > 50) {
      preview = doc.text.slice(0, 35);
      preview += `... (${doc.text.length - 70} more) ...`;
      preview += doc.text.slice(-15);
    }
    return `${tabs}text(${range}, "${preview}")\n`;
  }

  let sb = `${tabs}${doc.type.name}(${range}) {\n`;
  doc.content.forEach((node, childOffset) => {
    sb += stringifyDocumentStructure(
      node,
      tabs2,
      tabs,
      offset + childOffset + 1,
    );
  });
  sb += `${tabs}}\n`;

  const tock = performance.now();
  if (doc.type.name === "doc") {
    console.log(`stringifyDocumentStructure ${(tock - tick).toFixed(1)} ms`);
  }
  return sb;
}

// Get node positions from current TextSelection
export function getNodePositionsFromSelection(
  editor: MaybeRefOrGetter<Editor | undefined>,
) {
  editor = toValue(editor);
  if (!editor) return null;

  const { selection } = editor.state;
  const { anchor, head } = selection;

  const resolvedStart = editor.state.doc.resolve(anchor);
  const resolvedEnd = editor.state.doc.resolve(head);

  const startPosOfNode = resolvedStart.start();
  const endPosOfNode = resolvedEnd.end();

  const text = editor.state.doc.textBetween(startPosOfNode, endPosOfNode, "");

  return { start: startPosOfNode, end: endPosOfNode, text };
}

// To avoid Tiptap error of not allowing empty text node
export const getTextContentBySelectedText = (text: string) => {
  return text ? [{ type: "text", text }] : [];
};
