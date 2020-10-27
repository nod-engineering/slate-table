"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slate = require("slate");

var _creator = require("./creator");

var _utils = require("./utils");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var PreserveSpaceAfter = new Set(['table']);
var PreserveSpaceBefore = new Set(['table']);

var insertParagraph = function insertParagraph(editor, at) {
  var text = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  _slate.Transforms.insertNodes(editor, {
    type: 'paragraph',
    children: [{
      text: text
    }]
  }, {
    at: at
  });
};

var maybePreserveSpace = function maybePreserveSpace(editor, entry) {
  var _entry = _slicedToArray(entry, 2),
      node = _entry[0],
      path = _entry[1];

  var type = node.type;
  var preserved = false;

  if (PreserveSpaceAfter.has(type)) {
    var next = _slate.Editor.next(editor, {
      at: path
    });

    if (!next || PreserveSpaceBefore.has(next[0].type)) {
      insertParagraph(editor, _slate.Path.next(path));
      preserved = true;
    }
  }

  if (PreserveSpaceBefore.has(type)) {
    if (path[path.length - 1] === 0) {
      insertParagraph(editor, path);
      preserved = true;
    } else {
      var prev = _slate.Editor.previous(editor, {
        at: path
      });

      if (!prev || PreserveSpaceAfter.has(prev[0].type)) {
        insertParagraph(editor, path);
        preserved = true;
      }
    }
  }

  return preserved;
};

var tablePlugin = function tablePlugin(editor) {
  var deleteBackward = editor.deleteBackward,
      deleteFragment = editor.deleteFragment;

  editor.deleteFragment = function () {
    _slate.Transforms.removeNodes(editor, {
      match: function match(n) {
        return n.type === 'table';
      }
    });

    deleteFragment.apply(void 0, arguments);
  };

  editor.deleteBackward = function () {
    var selection = editor.selection;

    if (selection && _slate.Range.isCollapsed(selection)) {
      var isInTable = _slate.Editor.above(editor, {
        match: function match(n) {
          return n.type === 'table';
        }
      });

      if (isInTable) {
        var start = _slate.Editor.start(editor, selection);

        var isStart = _slate.Editor.isStart(editor, start, selection);

        var currCell = _slate.Editor.above(editor, {
          match: function match(n) {
            return n.type === 'table_cell';
          }
        });

        if (isStart && currCell && !_slate.Editor.string(editor, currCell[1])) {
          return;
        }
      }
    }

    deleteBackward.apply(void 0, arguments);
  };

  return editor;
};

var withTable = function withTable(editor) {
  var normalizeNode = editor.normalizeNode;

  editor.normalizeNode = function (entry) {
    if (maybePreserveSpace(editor, entry)) return;
    normalizeNode(entry);
  };

  return tablePlugin(editor);
};

var _default = withTable;
exports["default"] = _default;
//# sourceMappingURL=withTable.js.map