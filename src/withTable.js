import { createContent } from './creator';
import { isInSameTable } from './utils';
import { Editor, Transforms, Path, Range, Point, Node } from 'slate';

const PreserveSpaceAfter = new Set(['table']);
const PreserveSpaceBefore = new Set(['table']);

const insertParagraph = (editor, at, text = '') => {
  Transforms.insertNodes(
    editor,
    {
      type: 'paragraph',
      children: [{ text }],
    },
    {
      at,
    },
  );
};

const maybePreserveSpace = (editor, entry) => {
  const [node, path] = entry;
  const { type } = node;
  let preserved = false;

  if (PreserveSpaceAfter.has(type)) {
    const next = Editor.next(editor, { at: path });
    if (!next || PreserveSpaceBefore.has(next[0].type)) {
      insertParagraph(editor, Path.next(path));
      preserved = true;
    }
  }

  if (PreserveSpaceBefore.has(type)) {
    if (path[path.length - 1] === 0) {
      insertParagraph(editor, path);
      preserved = true;
    } else {
      const prev = Editor.previous(editor, { at: path });
      if (!prev || PreserveSpaceAfter.has(prev[0].type)) {
        insertParagraph(editor, path);
        preserved = true;
      }
    }
  }

  return preserved;
};

const withText = (editor, entry) => {
  const [node, path] = entry;
  const { text } = node;
  let result = false;
  if (text !== undefined) {
    const parent = Node.parent(editor, path);
    if (parent && parent.type === 'table_cell') {
      Transforms.wrapNodes(editor, { type: 'paragraph' }, { at: path });
      result = true;
    }
  }
  return result;
};

const withEmptyChildren = (editor, entry) => {
  try {
    const [path] = entry;
    const [, , , furthest] = Node.ancestors(editor, path, {
      reverse: true,
    });

    if (
      furthest &&
      furthest[0].type === 'table' &&
      (!furthest[0].children || !furthest[0].children.length)
    ) {
      const tableRowNode = {
        type: 'table_row',
        data: {},
        children: [
          {
            type: 'table_cell',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
          },
        ],
      };

      Transforms.insertNodes(editor, tableRowNode, { at: furthest[1] });
      return;
    }
  } catch (err) {
    console.log(err);
  }
};

// test idea
const withTableRow = (editor, entry) => {
  const [node, path] = entry;
  if (!node) return;

  if (node.type === 'table_row') {
    const [first, second, third, furthest] = Node.ancestors(editor, path);
    console.log({ first, second, third, furthest, node });

    // check if parent type is table - if not wrap by { type: 'table'}
    if (third[0].type !== 'table') {
      Transforms.wrapNodes(editor, { type: 'table' });
    }

    // check if children structure is current - if not insert
    if (!node.children || !node.children.length) {
      Transforms.insertNodes(editor, {
        type: 'table_cell',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                text: '',
              },
            ],
          },
        ],
      });
    }
  }
};

// test idea
const withTableCell = (editor, entry) => {
  const [node, path] = entry;
  if (!node) return;

  if (node.type === 'table_cell') {
    const [first, second, third, furthest] = Node.ancestors(editor, path);
    console.log({ first, second, third, furthest, node });

    // check if parent type is table_row - if not wrap by { type: 'table_row }
    if (furthest[0].type !== 'table_row') {
      Transforms.wrapNodes(editor, { type: 'table_row' });
    }

    // check if children structure is current - if not insert
    if (!node.children || !node.children.length) {
      Transforms.insertNodes(editor, {
        type: 'paragraph',
        children: [{ text: '' }],
      });
    }
  }
};

const tablePlugin = editor => {
  const { deleteBackward, deleteFragment, deleteForward } = editor;
  const matchCells = node => node.type === 'table_cell';

  editor.deleteFragment = (...args) => {
    if (editor.selection && isInSameTable(editor)) {
      const [content] = Editor.nodes(editor, {
        match: n => n.type === 'paragraph',
      });

      Transforms.insertNodes(editor, createContent(), { at: content[1] });
      Transforms.removeNodes(editor, { at: Path.next(content[1]) });

      return;
    }

    Transforms.removeNodes(editor, {
      match: n => n.type === 'table',
    });

    deleteFragment(...args);
  };
  editor.deleteBackward = (...args) => {
    const selection = editor && editor.selection;
    if (selection) return;

    if (selection && Range.isCollapsed(selection)) {
      const isInTable = Editor.above(editor, {
        match: n => n.type === 'table',
      });

      if (isInTable) {
        const start = Editor.start(editor, selection);
        const isStart = Editor.isStart(editor, start, selection);

        const currCell = Editor.above(editor, {
          match: n => n.type === 'table-cell',
        });

        if (isStart && currCell && !Editor.string(editor, currCell[1])) {
          return;
        }
      }
    }

    deleteBackward(...args);
  };

  const preventDeleteCell = (operation, pointCallback, nextPoint) => unit => {
    const selection = editor && editor.selection;
    if (!selection) return;

    if (Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: matchCells,
      });
      if (cell) {
        // Prevent deletions within a cell
        const [, cellPath] = cell;
        const start = pointCallback(editor, cellPath);

        if (selection && Point.equals(selection.anchor, start)) {
          return;
        }
      } else {
        // Prevent deleting cell when selection is before or after a table
        const next = nextPoint(editor, selection, { unit });
        const [nextCell] = Editor.nodes(editor, {
          match: matchCells,
          at: next,
        });
        if (nextCell) return;
      }
    }

    operation(unit);
  };

  // prevent deleting cells with deleteBackward
  editor.deleteBackward = preventDeleteCell(deleteBackward, Editor.start, Editor.before);

  // prevent deleting cells with deleteForward
  editor.deleteForward = preventDeleteCell(deleteForward, Editor.end, Editor.after);

  return editor;
};

const withTable = editor => {
  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    // if (maybePreserveSpace(editor, entry)) return;
    if (withText(editor, entry)) return;

    withEmptyChildren(editor, entry);
    // withTableRow(editor, entry);
    // withTableCell(editor, entry);

    normalizeNode(entry);
  };

  return tablePlugin(editor);
};

export default withTable;
