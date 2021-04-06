import { Transforms, Path, Node } from 'slate';

const removeTable = (table, editor) => {
  if (editor && table) {
    const path = table[1];

    try {
      Path.previous(table[1]);
    } catch (err) {
      if (err.message.includes('negative index')) {
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
    }

    Transforms.removeNodes(editor, {
      match: n => n.type === 'table',
      at: table[1],
    });
  }
};

export default removeTable;
