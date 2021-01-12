import { createContent } from './creator';
import { isInSameTable } from './utils';
import { Editor, Transforms, Path, Range, Point, Node } from "slate";

const PreserveSpaceAfter = new Set(['table']);
const PreserveSpaceBefore = new Set(['table']);

const insertParagraph = (
  editor,
  at,
  text = '',
) => {
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

const maybePreserveSpace = (
  editor,
  entry,
) => {
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
    if (parent && parent.type === "table_cell") {
      Transforms.wrapNodes(editor, { type: "paragraph" }, { at: path });
      result = true;
    }
  }
  return result;
};

const tablePlugin = (editor) => {
  const { deleteBackward, deleteFragment, deleteForward } = editor;
  const matchCells = (node) => node.type === 'table_cell'

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
    const { selection } = editor;
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

  const preventDeleteCell = (
    operation,
    pointCallback,
    nextPoint
  ) => (unit) => {
    const { selection } = editor;

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
   editor.deleteBackward = preventDeleteCell(
    deleteBackward,
    Editor.start,
    Editor.before
  );

  // prevent deleting cells with deleteForward
  editor.deleteForward = preventDeleteCell(
    deleteForward,
    Editor.end,
    Editor.after
  );

  return editor;
};


const withTable = (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    if (maybePreserveSpace(editor, entry)) return;
    if (withText(editor, entry)) return;

    normalizeNode(entry);
  };

  return tablePlugin(editor);
};

export default withTable;
