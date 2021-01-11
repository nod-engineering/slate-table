import { Editor, Transforms, Path } from 'slate';
import { splitedTable } from '../selection';
import { createCell } from '../creator';

const insertRight = (table, editor) => {
  const { selection } = editor;
  if (!selection || !table) return;

  const xIndex = table[1].length + 1;

  const { gridTable, getCol } = splitedTable(editor, table);

  const [startCell] = Editor.nodes(editor, {
    match: n => n.type === 'table_cell',
  });

  const [insertPositionCol] = getCol(
    (c) => c.cell.key === startCell[0].key && c.isReal,
  );

  const x =
    insertPositionCol.path[xIndex] + (insertPositionCol.cell.colspan || 1) - 1;

  const insertCols = new Map();
  let checkInsertable = true;

  gridTable.forEach((row) => {
    const col = row[x];

    const [originCol] = getCol(
      (n) => n.cell.key === col.cell.key && n.isReal,
    );

    const { cell, path } = originCol;

    if (
      !row[x + 1] ||
      (col.isReal && (!col.cell.colspan || col.cell.colspan === 1))
    ) {
      insertCols.set(cell.key, originCol);
    } else if (path[xIndex] + (cell.colspan || 1) - 1 === x) {
        insertCols.set(cell.key, originCol);
      } else {
        checkInsertable = false;
      }
  });

  if (!checkInsertable) {
    return;
  }

  insertCols.forEach((col) => {
    const newCell = createCell({
      rowspan: col.cell.rowspan || 1,
    });

    Transforms.insertNodes(editor, newCell, {
      at: Path.next(col.originPath),
    });
  });
}

export default insertRight;
