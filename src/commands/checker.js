/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
import { Editor } from 'slate';
import { checkMerge } from './mergeSelection';
import { splitedTable } from '../selection';

const checker = (table, editor, direction) => {
    if (!table || !editor.selection) return;
    const [start] = Editor.edges(editor, editor.selection);
    const [startNode] = Editor.nodes(editor, {
      match: n => n.type === 'table_cell',
      at: start,
    });
    const { key } = startNode[0];
    const { gridTable } = splitedTable(editor, table, key);
    const selectedTable = checkMerge(gridTable, startNode, direction);
    const hasMergedCells = startNode[0].colspan > 1 || startNode[0].rowspan > 1;
    if (hasMergedCells && direction) return false;
    if (!direction && hasMergedCells) {
        return true;
    }
    if (direction === 'right' && selectedTable.length === 1 && selectedTable[0].length) {
        return true;
    }
    if (direction === 'down' && selectedTable.length > 1) {
        return true;
    }
    return false;
}

export default checker;