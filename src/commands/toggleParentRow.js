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
const toggleParentRow = ({ table, editor, selected, row, type }) => {
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
    const isHighlightedRow = rows.children.every(
      ({ selectedCell }) => selectedCell
    );
    if (isHighlightedRow) {
      transformNode({ editor, path, selected, isParent });
    }
    if (!isHighlightedRow && row) {
      const [, path] = row;
      transformNode({ editor, path, selected, isParent });
    }
  }
};

export default toggleParentRow;
