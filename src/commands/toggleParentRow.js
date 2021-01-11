import { Transforms, Editor } from "slate";
import { get } from "../utils";

const toggleParentRow = ({ table, editor, selected, row, type }) => {
  const { selection } = editor;
  if (!table || !selection) return;
  const nodes = Editor.nodes(editor, {
    at: table[1],
    match: (n) => n.type === "table_row",
  });
  const isParent = type === "parent";
  if (row) {
    const [, path] = row;
    if (isParent) {
      if (!selected) {
        Transforms.setNodes(editor, { subParent: selected }, { at: path });
      }
      Transforms.setNodes(editor, { parent: selected }, { at: path });
    } else {
      Transforms.setNodes(editor, { subParent: selected }, { at: path });
    }
  }
  for (const node of nodes) {
    const [rows, path] = node;
    if (!get(rows, "children", []).length) return;
    for (const cell of rows.children) {
      if (get(cell, "selectedCell")) {
        const parentRow = get(rows, "parent", null);
        if (parentRow && get(parentRow, "id") !== get(selected, "id")) {
          Transforms.setNodes(editor, { subParent: selected }, { at: path });
        } else {
          Transforms.setNodes(editor, { parent: selected }, { at: path });
        }
      }
    }
  }
};

export default toggleParentRow;
