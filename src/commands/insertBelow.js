import { Editor, Transforms, Path } from 'slate';
import { splitedTable } from '../selection';
import { createRow } from '../creator';

const insertBelow = (table, editor) => {
  const { selection } = editor;
  if (!selection || !table) return;

  const yIndex = table[1].length;

  const { gridTable, getCol } = splitedTable(editor, table);

  const [startCell] = Editor.nodes(editor, {
    match: n => n.type === 'table_cell',
  });

  const [insertPositionCol] = getCol(
    (c) => c.cell.key === startCell[0].key && c.isReal,
  );

  let checkInsertEnable = true;
  const insertCols = new Map();

  const y =
    insertPositionCol.path[yIndex] + (insertPositionCol.cell.rowspan || 1) - 1;

  gridTable[y].forEach((col) => {
    const [originCol] = getCol(
      (n) => n.isReal && n.cell.key === col.cell.key,
    );

    const { cell, path } = originCol;

    if (!gridTable[y + 1]) {
      insertCols.set(cell.key, originCol);
    } else if (path[yIndex] + (cell.rowspan || 1) - 1 === y) {
      insertCols.set(cell.key, originCol);
    } else {
      checkInsertEnable = false;
    }
  });

  if (!checkInsertEnable) {
    return;
  }

  const newRow = createRow(insertCols.size);

  [...insertCols.values()].forEach((value, index) => {
    newRow.children[index].colspan = value.cell.colspan || 1;
  });

  const [[, path]] = Editor.nodes(editor, {
    match: n => n.type === 'table_row',
  });

  for (let i = 1; i < startCell[0].rowspan; i += 1) {
    path[yIndex] += 1;
  }

  Transforms.insertNodes(editor, newRow, {
    at: Path.next(path),
  });
}

export default insertBelow;
