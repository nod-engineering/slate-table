import { Transforms, Path, Node, Editor } from 'slate';

const removeTable = (table, editor) => {
  if (!editor || !table) return;

  const path = table[1];
  const previous = Editor.previous(editor, { at: path });

  if (!previous) {
    Transforms.insertNodes(
      editor,
      { type: 'paragraph', children: [{ text: ' ' }] },
      { at: [0, 0] },
    );

    const nextPath = Path.next(path);
    const nextNode = Node.get(editor, nextPath);

    if (nextNode && nextNode.type === 'table') {
      Transforms.removeNodes(editor, { at: nextPath });
    }

    return;
  }

  Transforms.removeNodes(editor, {
    match: n => n.type === 'table',
    at: path,
  });
};

export default removeTable;
