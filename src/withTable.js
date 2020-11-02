import { Editor, Transforms, Path, Range } from 'slate';
import { createContent } from './creator';
import { isInSameTable } from './utils';

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

const tablePlugin = (editor) => {
  const { deleteBackward, deleteFragment } = editor;

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

  return editor;
};


const withTable = (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    if (maybePreserveSpace(editor, entry)) return;

    normalizeNode(entry);
  };

  return tablePlugin(editor);
};

export default withTable;
