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

const tablePlugin = editor => {
  const { deleteBackward, deleteFragment, deleteForward } = editor;
  const matchCells = node => node.type === 'table_cell';

  editor.deleteFragment = (...args) => {
    if (editor.selection && isInSameTable(editor)) {
      const [content] = Editor.nodes(editor, {
        match: n => n.type === 'paragraph',
      });

      Transforms.insertNodes(editor, createContent(), { at: content[1] });

      if (content[1] && content[1].length) {
        Transforms.removeNodes(editor, { at: Path.next(content[1]) });
      }

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
    if (withText(editor, entry)) return;

    const [node, path] = entry;

    if (node && node.type === 'table' && node.children.length === 1 && !node.children[0].key) {
      Transforms.removeNodes(editor, { at: path });
    }

    normalizeNode(entry);
  };

  return tablePlugin(editor);
};

export default withTable;
