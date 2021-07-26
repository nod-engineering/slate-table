"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _creator = require("./creator");

var _utils = require("./utils");

var _slate = require("slate");

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

var withText = function withText(editor, entry) {
  var _entry = _slicedToArray(entry, 2),
      node = _entry[0],
      path = _entry[1];

  var text = node.text;
  var result = false;

  if (text !== undefined) {
    var parent = _slate.Node.parent(editor, path);

    if (parent && parent.type === 'table_cell') {
      _slate.Transforms.wrapNodes(editor, {
        type: 'paragraph'
      }, {
        at: path
      });

      result = true;
    }
  }

  return result;
};

var tablePlugin = function tablePlugin(editor) {
  var deleteBackward = editor.deleteBackward,
      deleteFragment = editor.deleteFragment,
      deleteForward = editor.deleteForward;

  var matchCells = function matchCells(node) {
    return node.type === 'table_cell';
  };

  editor.deleteFragment = function () {
    if (editor.selection && (0, _utils.isInSameTable)(editor)) {
      var _Editor$nodes = _slate.Editor.nodes(editor, {
        match: function match(n) {
          return n.type === 'paragraph';
        }
      }),
          _Editor$nodes2 = _slicedToArray(_Editor$nodes, 1),
          content = _Editor$nodes2[0];

      _slate.Transforms.insertNodes(editor, (0, _creator.createContent)(), {
        at: content[1]
      });

      if (content[1] && content[1].length) {
        _slate.Transforms.removeNodes(editor, {
          at: _slate.Path.next(content[1])
        });
      }

      return;
    }

    _slate.Transforms.removeNodes(editor, {
      match: function match(n) {
        return n.type === 'table';
      }
    });

    deleteFragment.apply(void 0, arguments);
  };

  editor.deleteBackward = function () {
    var selection = editor && editor.selection;
    if (selection) return;

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
            return n.type === 'table-cell';
          }
        });

        if (isStart && currCell && !_slate.Editor.string(editor, currCell[1])) {
          return;
        }
      }
    }

    deleteBackward.apply(void 0, arguments);
  };

  var preventDeleteCell = function preventDeleteCell(operation, pointCallback, nextPoint) {
    return function (unit) {
      var selection = editor && editor.selection;
      if (!selection) return;

      if (_slate.Range.isCollapsed(selection)) {
        var _Editor$nodes3 = _slate.Editor.nodes(editor, {
          match: matchCells
        }),
            _Editor$nodes4 = _slicedToArray(_Editor$nodes3, 1),
            cell = _Editor$nodes4[0];

        if (cell) {
          // Prevent deletions within a cell
          var _cell = _slicedToArray(cell, 2),
              cellPath = _cell[1];

          var start = pointCallback(editor, cellPath);

          if (selection && _slate.Point.equals(selection.anchor, start)) {
            return;
          }
        } else {
          // Prevent deleting cell when selection is before or after a table
          var next = nextPoint(editor, selection, {
            unit: unit
          });

          var _Editor$nodes5 = _slate.Editor.nodes(editor, {
            match: matchCells,
            at: next
          }),
              _Editor$nodes6 = _slicedToArray(_Editor$nodes5, 1),
              nextCell = _Editor$nodes6[0];

          if (nextCell) return;
        }
      }

      operation(unit);
    };
  }; // prevent deleting cells with deleteBackward


  editor.deleteBackward = preventDeleteCell(deleteBackward, _slate.Editor.start, _slate.Editor.before); // prevent deleting cells with deleteForward

  editor.deleteForward = preventDeleteCell(deleteForward, _slate.Editor.end, _slate.Editor.after);
  return editor;
};

var withTable = function withTable(editor) {
  var normalizeNode = editor.normalizeNode;

  editor.normalizeNode = function (entry) {
    if (withText(editor, entry)) return;

    var _entry2 = _slicedToArray(entry, 2),
        node = _entry2[0],
        path = _entry2[1];

    if (node && node.type === 'table' && node.children.length === 1 && !node.children[0].key) {
      _slate.Transforms.removeNodes(editor, {
        at: path
      });
    }

    normalizeNode(entry);
  };

  return tablePlugin(editor);
};

var _default = withTable;
exports["default"] = _default;
//# sourceMappingURL=withTable.js.map