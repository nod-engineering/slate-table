/* eslint-disable no-restricted-syntax */
import { Editor, Transforms, Path } from 'slate';
import { splitedTable } from '../selection';
import splitCell from './splitCell';
import { getNode } from '../utils';

const removeColumn = (table, editor) => {
  const { selection } = editor;
  if (!selection || !table) return;

  const path = table[1];
  const previous = Editor.previous(editor, { at: path });

  if (!previous) {
    try {
      if (table[0].children[0].children.length < 2) {
        Transforms.insertNodes(
          editor,
          { type: 'paragraph', children: [{ text: ' ' }] },
          { at: [0, 0] },
        );

        const nextPath = path && path.length && Path.next(path);
        const nextNode = nextPath && getNode(editor, nextPath);

        if (nextNode && nextNode.type === 'table') {
          Transforms.removeNodes(editor, { at: nextPath });
        }

        return;
      }
    } catch {}
  }

  const { gridTable, getCol } = splitedTable(editor, table);
  const xIndex = table[1].length + 1;

  const [start, end] = Editor.edges(editor, selection);
  const [startNode] = Editor.nodes(editor, {
    match: n => n.type === 'table_cell',
    at: start,
  });

  const [endNode] = Editor.nodes(editor, {
    match: n => n.type === 'table_cell',
    at: end,
  });

  const [startCol] = getCol(col => col.cell.key === startNode[0].key);
  const [endCol] = getCol(col => col.cell.key === endNode[0].key);

  const xLeft = startCol.path[xIndex];
  const xRight = endCol.path[xIndex];

  const topLeftCol = gridTable[0][xLeft];
  const bottomRight = gridTable[gridTable.length - 1][xRight];

  Transforms.setSelection(editor, {
    anchor: Editor.point(editor, topLeftCol.originPath),
    focus: Editor.point(editor, bottomRight.originPath),
  });

  splitCell(table, editor);

  const { gridTable: splitedGridTable } = splitedTable(editor, table);

  const removedCells = splitedGridTable.reduce((p, c) => {
    const cells = c.slice(xLeft, xRight + 1);
    return [...p, ...cells];
  }, []);

  removedCells.forEach(cell => {
    Transforms.removeNodes(editor, {
      at: table[1],
      match: n => n.key === cell.cell.key,
    });
  });

  Transforms.removeNodes(editor, {
    at: table[1],
    match: n => {
      if (n.type !== 'table_row') {
        return false;
      }

      if (!n.children || n.children.findIndex(cell => cell.type === 'table_cell') < 0) {
        return true;
      }

      return false;
    },
  });

  const rows = Editor.nodes(editor, {
    at: table[1],
    match: n => n.type === 'table_row',
  });

  for (const row of rows) {
    let minRowHeight = Infinity;
    row[0].children.forEach(cell => {
      const { rowspan = 1 } = cell;
      if (rowspan < minRowHeight) {
        minRowHeight = rowspan;
      }
    });

    if (minRowHeight > 1 && minRowHeight < Infinity) {
      row[0].children.forEach(cell => {
        Transforms.setNodes(
          editor,
          {
            rowspan: (cell.rowspan || 1) - minRowHeight + 1,
          },
          {
            at: table[1],
            match: n => n.key === cell.key,
          },
        );
      });
    }
  }

  const { gridTable: removedGridTable } = splitedTable(editor, table);

  if (!removedGridTable.length) {
    const contentAfterRemove = Editor.string(editor, table[1]);

    if (!contentAfterRemove) {
      Transforms.removeNodes(editor, {
        at: table[1],
      });
    }

    return;
  }

  for (let idx = 0; idx < removedGridTable[0].length; idx += 1) {
    let allColumnIsReal = true;
    let minColWidth = Infinity;

    for (let j = 0; j < removedGridTable.length; j += 1) {
      if (!removedGridTable[j][idx].isReal) {
        allColumnIsReal = false;
      } else {
        const { colspan = 1 } = removedGridTable[j][idx].cell;
        if (colspan < minColWidth) {
          minColWidth = colspan;
        }
      }
    }

    if (allColumnIsReal && minColWidth < Infinity && minColWidth > 1) {
      for (let j = 0; j < removedGridTable.length; j += 1) {
        const { cell } = removedGridTable[j][idx];
        Transforms.setNodes(
          editor,
          {
            colspan: (cell.colspan || 1) - minColWidth + 1,
          },
          {
            at: table[1],
            match: n => n.key === cell.key,
          },
        );
      }
    }
  }
};

export default removeColumn;
