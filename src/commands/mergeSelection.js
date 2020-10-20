/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
import { Editor, Transforms } from 'slate';
import { splitedTable } from '../selection';

export function checkMerge(table, startCell, direction) {
  const startCellKey = startCell[0].key;
  const selectedTable = [[]];
  let startCellKeyIndexInTable = -1;
  const isMergeDown = direction === 'down';
  table.forEach(row => {
    startCellKeyIndexInTable = isMergeDown && startCellKeyIndexInTable !== -1 ? startCellKeyIndexInTable : row.findIndex(obj => obj.cell.key === startCellKey);
    if (direction === 'right') {
      if (startCellKeyIndexInTable !== -1 && row.length > startCellKeyIndexInTable + 1) {
        selectedTable[0].push(row[startCellKeyIndexInTable], row[startCellKeyIndexInTable + 1]);
      }
    }
    if (isMergeDown) {
      if (startCellKeyIndexInTable !== -1) {
        if (selectedTable.length === 1 && selectedTable[0].length === 0) {
          selectedTable[0].push(row[startCellKeyIndexInTable]);
        } else {
          selectedTable.push([row[startCellKeyIndexInTable]]);
        }
      }
    }
  });
  return selectedTable;
}


const mergeSelection = (table, editor, direction = 'right') => {
  if (!table || !editor.selection) return;
  const [start] = Editor.edges(editor, editor.selection);
  const [startNode] = Editor.nodes(editor, {
    match: n => n.type === 'table_cell',
    at: start,
  });
  const { key } = startNode[0];
  const { gridTable } = splitedTable(editor, table, key);
  const [startCell] = Editor.nodes(editor, {
    match: n => n.key === key,
    at: [],
  });

  if (!startCell) return;
  const isMergeDown = direction === 'down';
  const selectedTable = checkMerge(gridTable, startCell, direction);
  if (!selectedTable) return;
  const downIndex = selectedTable.length - 1;
  const insertPositionCol = isMergeDown ? selectedTable[downIndex][0] : selectedTable[0][1];
  const tmpContent = {};

  gridTable.forEach((row) => {
    row.forEach((col) => {
      if (col.cell.key === insertPositionCol.cell.key &&
        col.isReal
      ) {
        const [node] = Editor.nodes(editor, {
          match: n => n.key === col.cell.key,
          at: [],
        });
        if (node) {
          if (Editor.string(editor, node[1])) {
            tmpContent[col.cell.key] = node[0].children;
          }

          Transforms.removeNodes(editor, {
            at: table[1],
            match: n => n.key === col.cell.key,
          });
        }
      }
    });
  });
  Transforms.setNodes(
    editor,
    {
      height: 0,
      width: 0,
      colspan: selectedTable[0].length,
      rowspan: selectedTable.length,
    },
    {
      at: table[1],
      match: n => n.key === selectedTable[0][0].cell.key,
    },
  );

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

  const rows = Editor.nodes(editor, {
    at: table[1],
    match: n => n.type === 'table_row',
  });

  for (const row of rows) {
    let minRowHeight = Infinity;
    // eslint-disable-next-line no-loop-func
    row[0].children.forEach((cell) => {
      const { rowspan = 1 } = cell;
      if (rowspan < minRowHeight) {
        minRowHeight = rowspan;
      }
    });

    if (minRowHeight > 1 && minRowHeight < Infinity) {
      row[0].children.forEach((cell) => {
        Transforms.setNodes(
          editor,
          {
            height: 0,
            width: 0,
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
  const { gridTable: mergedGridTable } = splitedTable(editor, table);
  for (let idx = 0; idx < mergedGridTable[0].length; idx += 1) {
    let allColumnIsReal = true;
    let minColWidth = Infinity;

    for (let j = 0; j < mergedGridTable.length; j += 1) {
      // eslint-disable-next-line no-continue
      if (!mergedGridTable[j][idx]) continue;

      if (!mergedGridTable[j][idx].isReal) {
        allColumnIsReal = false;
      } else {
        const { colspan = 1 } = mergedGridTable[j][idx].cell;
        if (colspan < minColWidth) {
          minColWidth = colspan;
        }
      }
    }

    if (allColumnIsReal && minColWidth < Infinity && minColWidth > 1) {
      for (let j = 0; j < mergedGridTable.length; j += 1) {
        const { cell } = mergedGridTable[j][idx];
        Transforms.setNodes(
          editor,
          {
            height: 0,
            width: 0,
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

  const [insertContents] = Editor.nodes(editor, {
    at: selectedTable[0][0].originPath,
    match: n => n.type === 'paragraph',
  });
  Object.values(tmpContent).forEach(content => {
    if (content[0] && content[0].children) {
      Transforms.insertNodes(editor, content[0].children, {
        at: Editor.end(editor, insertContents[1]),
      });
    }
  });
}

export default mergeSelection;