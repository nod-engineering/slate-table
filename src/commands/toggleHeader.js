import { Transforms } from 'slate';
import { get } from '../utils';


const toggleHeader = (table, editor) => {
    if (!table || !editor.selection) return;
    const tableData = table[0];
    if (get(tableData, 'headless', true)) {
        Transforms.setNodes(editor, {headless: false}, {
            at: table[1],
        });
        Transforms.setNodes(editor, {isHeader: true}, {
            at: table[1].concat([0]),
          });
    } else {
        Transforms.setNodes(editor, {headless: true}, {
            at: table[1],
        });
        Transforms.setNodes(editor, {isHeader: false}, {
            at: table[1].concat([0]),
          });
    }
}


export default toggleHeader;