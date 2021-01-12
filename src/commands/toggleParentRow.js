import { Transforms, Editor } from "slate";
import { get } from "../utils";

const toggleParentRow = ({ table, editor, selected, type }) => {
  const { selection } = editor;
  if (!table || !selection) return;
  const nodes = Editor.nodes(editor, {
    at: table[1],
    match: (n) => n.type === "table_row",
  });
  const isParent = type === "parent";
  for (const node of nodes) {
    const [rows, path] = node;
    if (!get(rows, "children", []).length) return;
    for (const cell of rows.children) {
      if (get(cell, "selectedCell")) {
        if (isParent) {
          if (!selected) {
            Transforms.setNodes(editor, { subParent: selected }, { at: path });
          }
          Transforms.setNodes(editor, { parent: selected }, { at: path });
        } else {
          Transforms.setNodes(editor, { subParent: selected }, { at: path });
        }
      }
    }
  }
};

export default toggleParentRow;
