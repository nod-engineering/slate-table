import { Transforms, Editor } from "slate";
import { get } from "../utils";

const transformNode = ({ editor, path, selected, isParent }) => {
  if (isParent) {
    if (!selected) {
      Transforms.setNodes(editor, { subParent: selected }, { at: path });
    }
    Transforms.setNodes(editor, { parent: selected }, { at: path });
  } else {
    Transforms.setNodes(editor, { subParent: selected }, { at: path });
  }
};
const toggleParentRow = ({ table, editor, selected, rows, type }) => {
  const { selection } = editor;
  if (!table || !selection) return;
  const isParent = type === "parent";
  if (rows && rows.length) {
    for (const row of rows) {
      const path = ReactEditor.findPath(editor, row);
      transformNode({ editor, path, selected, isParent });
    }
  } else {
    const nodes = Editor.nodes(editor, {
      at: table[1],
      match: (n) => n.type === "table_row",
    });
    for (const node of nodes) {
      const [nodeRows, path] = node;
      if (!get(nodeRows, "children", []).length) return;
      const isHighlightedRow = nodeRows.children.every(
        ({ selectedCell }) => selectedCell
      );
      if (isHighlightedRow) {
        transformNode({ editor, path, selected, isParent });
      }
    }
  }
};

export default toggleParentRow;
