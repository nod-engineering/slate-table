import { Transforms } from 'slate';

const removeTable = (table, editor) => {
  if (editor && table) {
    Transforms.removeNodes(editor, {
      match: n => n.type === 'table',
      at: table[1],
    });
  }
}

export default removeTable;
