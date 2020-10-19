import { v4 as uuid } from 'uuid';

export function createContent(elements) {
  return {
    type: 'paragraph',
    children: elements || [{ text: '' }],
  };
}


export function createCell({
  elements,
  colspan,
  rowspan,
  height,
  width,
} = {}) {
  const content = createContent(elements);

  return {
    type: 'table_cell',
    key: `cell_${uuid()}`,
    children: [content],
    width,
    height,
    colspan,
    rowspan,
  };
}

export function createRow(columns) {
  const cellNodes = [...new Array(columns)].map(() => createCell());

  return {
    type: 'table_row',
    key: `row_${uuid()}`,
    data: {},
    children: cellNodes,
  };
}

export function createTable(columns, rows) {
  const rowNodes = [...new Array(rows)].map(() => createRow(columns));

  return {
    type: 'table',
    children: rowNodes,
    data: {},
  };
}
