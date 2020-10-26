"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slate = require("slate");

var _creator = require("./creator");

var _utils = require("./utils");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

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
  var addMark = editor.addMark,
      removeMark = editor.removeMark,
      deleteBackward = editor.deleteBackward,
      deleteFragment = editor.deleteFragment;

  editor.addMark = function (key, value) {
    if (editor.selection) {
      var lastSelection = editor.selection;

      var selectedCells = _slate.Editor.nodes(editor, {
        match: function match(n) {
          return n.selectedCell;
        },
        at: []
      });

      var isTable = false;

      var _iterator = _createForOfIteratorHelper(selectedCells),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var cell = _step.value;

          if (!isTable) {
            isTable = true;
          }

          var _Editor$nodes = _slate.Editor.nodes(editor, {
            match: function match(n) {
              return n.type === 'table_content';
            },
            at: cell[1]
          }),
              _Editor$nodes2 = _slicedToArray(_Editor$nodes, 1),
              content = _Editor$nodes2[0];

          if (_slate.Editor.string(editor, content[1]) !== '') {
            _slate.Transforms.setSelection(editor, _slate.Editor.range(editor, cell[1]));

            addMark(key, value);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      if (isTable) {
        _slate.Transforms.select(editor, lastSelection);

        return;
      }
    }

    addMark(key, value);
  };

  editor.removeMark = function (key) {
    if (editor.selection) {
      var lastSelection = editor.selection;

      var selectedCells = _slate.Editor.nodes(editor, {
        match: function match(n) {
          return n.selectedCell;
        },
        at: []
      });

      var isTable = false;

      var _iterator2 = _createForOfIteratorHelper(selectedCells),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var cell = _step2.value;

          if (!isTable) {
            isTable = true;
          }

          var _Editor$nodes3 = _slate.Editor.nodes(editor, {
            match: function match(n) {
              return n.type === 'table_content';
            },
            at: cell[1]
          }),
              _Editor$nodes4 = _slicedToArray(_Editor$nodes3, 1),
              content = _Editor$nodes4[0];

          if (_slate.Editor.string(editor, content[1]) !== '') {
            _slate.Transforms.setSelection(editor, _slate.Editor.range(editor, cell[1]));

            removeMark(key);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      if (isTable) {
        _slate.Transforms.select(editor, lastSelection);

        return;
      }
    }

    removeMark(key);
  };

  editor.deleteFragment = function () {
    if (editor.selection && (0, _utils.isInSameTable)(editor)) {
      var selectedCells = _slate.Editor.nodes(editor, {
        match: function match(n) {
          return n.selectedCell;
        }
      });

      var _iterator3 = _createForOfIteratorHelper(selectedCells),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var cell = _step3.value;

          _slate.Transforms.setSelection(editor, _slate.Editor.range(editor, cell[1]));

          var _Editor$nodes5 = _slate.Editor.nodes(editor, {
            match: function match(n) {
              return n.type === 'table_content';
            }
          }),
              _Editor$nodes6 = _slicedToArray(_Editor$nodes5, 1),
              content = _Editor$nodes6[0];

          _slate.Transforms.insertNodes(editor, (0, _creator.createContent)(), {
            at: content[1]
          });

          _slate.Transforms.removeNodes(editor, {
            at: _slate.Path.next(content[1])
          });
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
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