/* eslint-disable no-debugger */
import { Transforms, Editor, Path } from 'slate';
import { splitedTable } from '../selection';
import splitCell from './splitCell';
import { getNode } from '../utils';

const removeRow = (table, editor) => {
  const { selection } = editor;
  if (!selection || !table) return;

  const path = table[1];

  const previous = Editor.previous(editor, { at: path });

  if (!previous) {
    if (table[0].children.length < 2) {
      Transforms.insertNodes(
        editor,
        { type: 'paragraph', children: [{ text: '' }] },
        { at: [0, 0] },
      );

      const nextPath = path && path.length && Path.next(path);
      const nextNode = nextPath && getNode(editor, nextPath);

      if (nextNode && nextNode.type === 'table') {
        Transforms.removeNodes(editor, { at: nextPath });
      }

      return;
    }
  }

  const { gridTable, getCol } = splitedTable(editor, table);

  const yIndex = table[1].length;

  const [start, end] = Editor.edges(editor, selection);
  const [startNode] = Editor.nodes(editor, {
    match: n => n.type === 'table_cell',
    at: start,
  });

  const [endNode] = Editor.nodes(editor, {
    match: n => n.type === 'table_cell',
    at: end,
  });

  if (!startNode || !endNode) return;

  const [startCol] = getCol(col => col.cell.key === startNode[0].key);
  const [endCol] = getCol(col => col.cell.key === endNode[0].key);

  const yTop = startCol.path[yIndex];
  const yBottom = endCol.path[yIndex];

  const topLeftCol = gridTable[yTop][0];
  const bottomRight = gridTable[yBottom][gridTable[yBottom].length - 1];

  Transforms.setSelection(editor, {
    anchor: Editor.point(editor, topLeftCol.originPath),
    focus: Editor.point(editor, bottomRight.originPath),
  });

  splitCell(table, editor);

  const rowsToDelete = table[0].children.slice(yTop, yBottom + 1);

  rowsToDelete.forEach(row => {
    Transforms.removeNodes(editor, {
      at: table[1],
      match: n => n.key === row.key,
    });
  });
};

export default removeRow;
