import { Transforms, Editor } from "slate";

const toggleHeader = (table, editor, data) => {
  const { selection } = editor;
  if (!table || !selection) return;
  const [start] = Editor.edges(editor, selection);
  const [startNode] = Editor.nodes(editor, {
    match: (n) => n.type === "table_row",
    at: start,
  });
  Transforms.setNodes(editor, data, { at: startNode[1] });
};

export default toggleHeader;
