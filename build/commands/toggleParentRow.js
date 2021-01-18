"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slate = require("slate");

var _utils = require("../utils");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var transformNode = function transformNode(_ref) {
  var editor = _ref.editor,
      path = _ref.path,
      selected = _ref.selected,
      isParent = _ref.isParent;

  if (isParent) {
    if (!selected) {
      _slate.Transforms.setNodes(editor, {
        subParent: selected
      }, {
        at: path
      });
    }

    _slate.Transforms.setNodes(editor, {
      parent: selected
    }, {
      at: path
    });
  } else {
    _slate.Transforms.setNodes(editor, {
      subParent: selected
    }, {
      at: path
    });
  }
};

var toggleParentRow = function toggleParentRow(_ref2) {
  var table = _ref2.table,
      editor = _ref2.editor,
      selected = _ref2.selected,
      rows = _ref2.rows,
      type = _ref2.type;
  var selection = editor.selection;
  if (!table || !selection) return;
  var isParent = type === "parent";

  if (rows && rows.length) {
    var _iterator = _createForOfIteratorHelper(rows),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var row = _step.value;
        var path = ReactEditor.findPath(editor, row);
        transformNode({
          editor: editor,
          path: path,
          selected: selected,
          isParent: isParent
        });
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  } else {
    var nodes = _slate.Editor.nodes(editor, {
      at: table[1],
      match: function match(n) {
        return n.type === "table_row";
      }
    });

    var _iterator2 = _createForOfIteratorHelper(nodes),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var node = _step2.value;

        var _node = _slicedToArray(node, 2),
            nodeRows = _node[0],
            _path = _node[1];

        if (!(0, _utils.get)(nodeRows, "children", []).length) return;
        var isHighlightedRow = nodeRows.children.every(function (_ref3) {
          var selectedCell = _ref3.selectedCell;
          return selectedCell;
        });

        if (isHighlightedRow) {
          transformNode({
            editor: editor,
            path: _path,
            selected: selected,
            isParent: isParent
          });
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  }
};

var _default = toggleParentRow;
exports["default"] = _default;
//# sourceMappingURL=toggleParentRow.js.map