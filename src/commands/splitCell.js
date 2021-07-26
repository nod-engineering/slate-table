import { Transforms, Editor } from 'slate';
import { splitedTable } from '../selection';
import { createCell } from '../creator';

const splitCell = (table, editor) => {
  const { selection } = editor;
  if (!selection || !table) return;

  const yIndex = table[1].length;
  const xIndex = table[1].length + 1;

  const { getCol } = splitedTable(editor, table);

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

  const [startCell] = getCol((n) => n.cell.key === startNode[0].key);
  const [endCell] = getCol((n) => n.cell.key === endNode[0].key);

  const [yStart, yEnd] = [startCell.path[yIndex], endCell.path[yIndex]];
  const [xStart, xEnd] = [startCell.path[xIndex], endCell.path[xIndex]];

  const sourceCells = [];
  const selectedCols = getCol((n) => {
    if (n.cell.selectedCell) {
      return true;
    }

    const [y, x] = n.path.slice(yIndex, xIndex + 1);
    if (y >= yStart && y <= yEnd && x >= xStart && x <= xEnd) {
      if (!n.isReal) {
        const [sourceCell] = getCol(
          (s) => s.isReal && s.cell.key === n.cell.key,
        );
        sourceCells.push(sourceCell);
      }
      return true;
    }

    return false;
  });

  selectedCols.push(...sourceCells);

  const filterColsObject = selectedCols.reduce(
    (p, c) => {
      if (c.isReal) {
        // eslint-disable-next-line no-param-reassign
        p[c.cell.key] = c;
      }
      return p;
    },
    {},
  );

  Object.values(filterColsObject).forEach((col) => {
    const { cell, isReal, originPath } = col;
    const { rowspan = 1, colspan = 1, children } = cell;

    if (isReal && (rowspan !== 1 || colspan !== 1)) {
      Transforms.delete(editor, {
        at: originPath,
      });

      for (let i = 0; i < rowspan; i += 1) {
        for (let j = 0; j < colspan; j += 1) {
          const newPath = Array.from(originPath);
          newPath[yIndex] += i;

          const newCell = createCell({
            width: 0,
            height: 0,
            elements:
              i === 0 && j === colspan - 1 ? children[0].children : null,
          });

          Transforms.insertNodes(editor, newCell, {
            at: newPath,
          });
        }
      }
    }
  });
}

export default splitCell;
