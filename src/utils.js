import { Editor, Path, Text } from 'slate';

export function checkTableIsExist(editor, table) {
  const cells = Array.from(
    Editor.nodes(editor, {
      at: table[1],
      match: n => n.type === 'table-cell',
    }),
  );

  return !!cells.length;
}

export function isTableElement(type) {
  return (
    type === 'table' || type === 'table-row' || type === 'table-cell' || type === 'table-content'
  );
}

export function isInSameTable(editor) {
  if (!editor.selection) return false;

  const [start, end] = Editor.edges(editor, editor.selection);
  const [startTable] = Editor.nodes(editor, {
    at: start,
    match: n => n.type === 'table',
  });

  const [endTable] = Editor.nodes(editor, {
    at: end,
    match: n => n.type === 'table',
  });

  if (startTable && endTable) {
    const [, startPath] = startTable;
    const [, endPath] = endTable;

    if (Path.equals(startPath, endPath)) {
      return true;
    }
  }

  return false;
}

export function get(obj, path, defaultValue = undefined) {
  const travel = regexp =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
}

export const getNode = (editor, path) => {
  let node = editor;

  for (let i = 0; i < path.length; i += 1) {
    const p = path[i];

    if (Text.isText(node) || !node.children[p]) {
      return undefined;
    }

    node = node.children[p];
  }

  return node;
};
