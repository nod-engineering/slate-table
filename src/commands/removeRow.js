/* eslint-disable no-debugger */
import { Transforms, Editor } from 'slate';
import { splitedTable } from '../selection';
import { splitCell } from './splitCell';

const removeRow = (table, editor) => {
  const { selection } = editor;
  if (!selection || !table) return;

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

  const [startCol] = getCol((col) => col.cell.key === startNode[0].key);
  const [endCol] = getCol((col) => col.cell.key === endNode[0].key);

  const yTop = startCol.path[yIndex];
  const yBottom = endCol.path[yIndex];

  const topLeftCol = gridTable[yTop][0];
  const bottomRight = gridTable[yBottom][gridTable[yBottom].length - 1];

  Transforms.setSelection(editor, {
    anchor: Editor.point(editor, topLeftCol.originPath),
    focus: Editor.point(editor, bottomRight.originPath),
  });

  splitCell(table, editor);

  const { gridTable: splitedGridTable } = splitedTable(editor, table);

  const removeCols = splitedGridTable
    .slice(yTop, yBottom + 1)
    .reduce((p, c) => [...p, ...c], []);

  removeCols.forEach((col) => {
    Transforms.removeNodes(editor, {
      at: table[1],
      match: n => n.key === col.cell.key,
    });
  });

  Transforms.removeNodes(editor, {
    at: table[1],
    match: n => {
      if (n.type !== 'table_row') {
        return false;
      }

      if (
        !n.children ||
        n.children.findIndex((cell) => cell.type === 'table_cell') < 0
      ) {
        return true;
      }

      return false;
    },
  });

  if (!Editor.string(editor, table[1])) {
    Transforms.removeNodes(editor, {
      at: table[1],
    });
  }
}

export default removeRow;