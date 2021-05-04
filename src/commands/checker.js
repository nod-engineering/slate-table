/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
import { Editor } from 'slate';
import { checkMerge } from './mergeSelection';
import { splitedTable } from '../selection';

const checker = (table, editor, direction) => {
    if (!table || !editor.selection) return;
    try {
        const [start] = Editor.edges(editor, editor.selection);
        const [startNode] = Editor.nodes(editor, {
        match: n => n.type === 'table_cell',
        at: start,
        });
        const { key } = startNode[0];
        const { gridTable } = splitedTable(editor, table, key);
        const selectedTable = checkMerge(gridTable, startNode, direction);
        const startNodeColspan = startNode[0].colspan || 1;
        const startNodeRowspan = startNode[0].rowspan || 1;
        const hasMergedCells = startNodeColspan > 1 || startNodeRowspan > 1;
        if (direction === 'down') {
            const selectedTableLen = selectedTable.length;
            if (selectedTableLen < 2 || startNodeRowspan === selectedTableLen ) return false;
            const nextNodeColspan = selectedTable[selectedTableLen - 1][0].cell.colspan || undefined;
            if (startNodeColspan === 1 && nextNodeColspan === undefined) return true;
            if (startNodeColspan !== nextNodeColspan) return false;
            return true;
        }
        if (direction === 'right') {
            const selectedTableLen = selectedTable[0].length;
            if (selectedTableLen < 2 || startNodeColspan === selectedTableLen ) return false;
            const nextNodeRowspan = selectedTable[0][selectedTableLen - 1].cell.rowspan || undefined;
            if (startNodeRowspan === 1 && nextNodeRowspan === undefined) return true;
            if (startNodeRowspan !== nextNodeRowspan) return false;
            return true;
        }
        if (!direction && hasMergedCells) {
            return true;
        }
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }

}

export default checker;