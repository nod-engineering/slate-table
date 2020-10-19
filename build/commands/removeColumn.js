"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slate = require("slate");

var _selection = require("../selection");

var _splitCell = require("./splitCell");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var removeColumn = function removeColumn(table, editor) {
  var selection = editor.selection;
  if (!selection || !table) return;

  var _splitedTable = (0, _selection.splitedTable)(editor, table),
      gridTable = _splitedTable.gridTable,
      getCol = _splitedTable.getCol;

  var xIndex = table[1].length + 1;

  var _Editor$edges = _slate.Editor.edges(editor, selection),
      _Editor$edges2 = _slicedToArray(_Editor$edges, 2),
      start = _Editor$edges2[0],
      end = _Editor$edges2[1];

  var _Editor$nodes = _slate.Editor.nodes(editor, {
    match: function match(n) {
      return n.type === 'table_cell';
    },
    at: start
  }),
      _Editor$nodes2 = _slicedToArray(_Editor$nodes, 1),
      startNode = _Editor$nodes2[0];

  var _Editor$nodes3 = _slate.Editor.nodes(editor, {
    match: function match(n) {
      return n.type === 'table_cell';
    },
    at: end
  }),
      _Editor$nodes4 = _slicedToArray(_Editor$nodes3, 1),
      endNode = _Editor$nodes4[0];

  var _getCol = getCol(function (col) {
    return col.cell.key === startNode[0].key;
  }),
      _getCol2 = _slicedToArray(_getCol, 1),
      startCol = _getCol2[0];

  var _getCol3 = getCol(function (col) {
    return col.cell.key === endNode[0].key;
  }),
      _getCol4 = _slicedToArray(_getCol3, 1),
      endCol = _getCol4[0];

  var xLeft = startCol.path[xIndex];
  var xRight = endCol.path[xIndex];
  var topLeftCol = gridTable[0][xLeft];
  var bottomRight = gridTable[gridTable.length - 1][xRight];

  _slate.Transforms.setSelection(editor, {
    anchor: _slate.Editor.point(editor, topLeftCol.originPath),
    focus: _slate.Editor.point(editor, bottomRight.originPath)
  });

  (0, _splitCell.splitCell)(table, editor);

  var _splitedTable2 = (0, _selection.splitedTable)(editor, table),
      splitedGridTable = _splitedTable2.gridTable;

  var removedCells = splitedGridTable.reduce(function (p, c) {
    var cells = c.slice(xLeft, xRight + 1);
    return [].concat(_toConsumableArray(p), _toConsumableArray(cells));
  }, []);
  removedCells.forEach(function (cell) {
    _slate.Transforms.removeNodes(editor, {
      at: table[1],
      match: function match(n) {
        return n.key === cell.cell.key;
      }
    });
  });

  _slate.Transforms.removeNodes(editor, {
    at: table[1],
    match: function match(n) {
      if (n.type !== 'table_row') {
        return false;
      }

      if (!n.children || n.children.findIndex(function (cell) {
        return cell.type === 'table_cell';
      }) < 0) {
        return true;
      }

      return false;
    }
  });

  var rows = _slate.Editor.nodes(editor, {
    at: table[1],
    match: function match(n) {
      return n.type === 'table_row';
    }
  });

  var _iterator = _createForOfIteratorHelper(rows),
      _step;

  try {
    var _loop2 = function _loop2() {
      var row = _step.value;
      var minRowHeight = Infinity;
      row[0].children.forEach(function (cell) {
        var _cell$rowspan = cell.rowspan,
            rowspan = _cell$rowspan === void 0 ? 1 : _cell$rowspan;

        if (rowspan < minRowHeight) {
          minRowHeight = rowspan;
        }
      });

      if (minRowHeight > 1 && minRowHeight < Infinity) {
        row[0].children.forEach(function (cell) {
          _slate.Transforms.setNodes(editor, {
            rowspan: (cell.rowspan || 1) - minRowHeight + 1
          }, {
            at: table[1],
            match: function match(n) {
              return n.key === cell.key;
            }
          });
        });
      }
    };

    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop2();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  var _splitedTable3 = (0, _selection.splitedTable)(editor, table),
      removedGridTable = _splitedTable3.gridTable;

  if (!removedGridTable.length) {
    var contentAfterRemove = _slate.Editor.string(editor, table[1]);

    if (!contentAfterRemove) {
      _slate.Transforms.removeNodes(editor, {
        at: table[1]
      });
    }

    return;
  }

  for (var idx = 0; idx < removedGridTable[0].length; idx += 1) {
    var allColumnIsReal = true;
    var minColWidth = Infinity;

    for (var j = 0; j < removedGridTable.length; j += 1) {
      if (!removedGridTable[j][idx].isReal) {
        allColumnIsReal = false;
      } else {
        var _removedGridTable$j$i = removedGridTable[j][idx].cell.colspan,
            colspan = _removedGridTable$j$i === void 0 ? 1 : _removedGridTable$j$i;

        if (colspan < minColWidth) {
          minColWidth = colspan;
        }
      }
    }

    if (allColumnIsReal && minColWidth < Infinity && minColWidth > 1) {
      var _loop = function _loop(_j) {
        var cell = removedGridTable[_j][idx].cell;

        _slate.Transforms.setNodes(editor, {
          colspan: (cell.colspan || 1) - minColWidth + 1
        }, {
          at: table[1],
          match: function match(n) {
            return n.key === cell.key;
          }
        });
      };

      for (var _j = 0; _j < removedGridTable.length; _j += 1) {
        _loop(_j);
      }
    }
  }
};

var _default = removeColumn;
exports["default"] = _default;
//# sourceMappingURL=removeColumn.js.map