import { Transforms, Editor, Range } from 'slate';
import { createTable } from '../creator';

const insertTable = (editor) => {
  console.log('test')
  if (!editor.selection) return;

  const node = Editor.above(editor, {
    match: n => n.type === 'table',
  });

  const isCollapsed = Range.isCollapsed(editor.selection);

  if (!node && isCollapsed) {
    const table = createTable(2, 2);
    Transforms.insertNodes(editor, table);
  }
}

export default insertTable;
