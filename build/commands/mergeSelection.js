"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkMerge = checkMerge;
exports["default"] = void 0;

var _slate = require("slate");

var _selection = require("../selection");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function checkMerge(table, startCell, direction) {
  var startCellKey = startCell[0].key;
  var selectedTable = [[]];
  var startCellKeyIndexInTable = -1;
  var isMergeDown = direction === 'down';
  table.forEach(function (row) {
    startCellKeyIndexInTable = isMergeDown && startCellKeyIndexInTable !== -1 ? startCellKeyIndexInTable : row.findIndex(function (obj) {
      return obj.cell.key === startCellKey;
    });

    if (direction === 'right') {
      if (startCellKeyIndexInTable !== -1 && row.length > startCellKeyIndexInTable + 1) {
        selectedTable[0].push(row[startCellKeyIndexInTable], row[startCellKeyIndexInTable + 1]);
      }
    }

    if (isMergeDown) {
      if (startCellKeyIndexInTable !== -1) {
        if (selectedTable.length === 1 && selectedTable[0].length === 0) {
          selectedTable[0].push(row[startCellKeyIndexInTable]);
        } else {
          selectedTable.push([row[startCellKeyIndexInTable]]);
        }
      }
    }
  });
  return selectedTable;
}

var mergeSelection = function mergeSelection(table, editor) {
  var direction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'right';
  if (!table || !editor.selection) return;

  var _Editor$edges = _slate.Editor.edges(editor, editor.selection),
      _Editor$edges2 = _slicedToArray(_Editor$edges, 1),
      start = _Editor$edges2[0];

  var _Editor$nodes = _slate.Editor.nodes(editor, {
    match: function match(n) {
      return n.type === 'table_cell';
    },
    at: start
  }),
      _Editor$nodes2 = _slicedToArray(_Editor$nodes, 1),
      startNode = _Editor$nodes2[0];

  var key = startNode[0].key;

  var _splitedTable = (0, _selection.splitedTable)(editor, table, key),
      gridTable = _splitedTable.gridTable;

  var _Editor$nodes3 = _slate.Editor.nodes(editor, {
    match: function match(n) {
      return n.key === key;
    },
    at: []
  }),
      _Editor$nodes4 = _slicedToArray(_Editor$nodes3, 1),
      startCell = _Editor$nodes4[0];

  if (!startCell) return;
  var isMergeDown = direction === 'down';
  var selectedTable = checkMerge(gridTable, startCell, direction);
  if (!selectedTable) return;
  var downIndex = selectedTable.length - 1;
  var insertPositionCol = isMergeDown ? selectedTable[downIndex][0] : selectedTable[0][1];
  var tmpContent = {};
  gridTable.forEach(function (row) {
    row.forEach(function (col) {
      if (col.cell.key === insertPositionCol.cell.key && col.isReal) {
        var _Editor$nodes5 = _slate.Editor.nodes(editor, {
          match: function match(n) {
            return n.key === col.cell.key;
          },
          at: []
        }),
            _Editor$nodes6 = _slicedToArray(_Editor$nodes5, 1),
            node = _Editor$nodes6[0];

        if (node) {
          if (_slate.Editor.string(editor, node[1])) {
            tmpContent[col.cell.key] = node[0].children;
          }

          _slate.Transforms.removeNodes(editor, {
            at: table[1],
            match: function match(n) {
              return n.key === col.cell.key;
            }
          });
        }
      }
    });
  });

  _slate.Transforms.setNodes(editor, {
    height: 0,
    width: 0,
    colspan: selectedTable[0].length,
    rowspan: selectedTable.length
  }, {
    at: table[1],
    match: function match(n) {
      return n.key === selectedTable[0][0].cell.key;
    }
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
      var minRowHeight = Infinity; // eslint-disable-next-line no-loop-func

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
            height: 0,
            width: 0,
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

  var _splitedTable2 = (0, _selection.splitedTable)(editor, table),
      mergedGridTable = _splitedTable2.gridTable;

  for (var idx = 0; idx < mergedGridTable[0].length; idx += 1) {
    var allColumnIsReal = true;
    var minColWidth = Infinity;

    for (var j = 0; j < mergedGridTable.length; j += 1) {
      // eslint-disable-next-line no-continue
      if (!mergedGridTable[j][idx]) continue;

      if (!mergedGridTable[j][idx].isReal) {
        allColumnIsReal = false;
      } else {
        var _mergedGridTable$j$id = mergedGridTable[j][idx].cell.colspan,
            colspan = _mergedGridTable$j$id === void 0 ? 1 : _mergedGridTable$j$id;

        if (colspan < minColWidth) {
          minColWidth = colspan;
        }
      }
    }

    if (allColumnIsReal && minColWidth < Infinity && minColWidth > 1) {
      var _loop = function _loop(_j) {
        var cell = mergedGridTable[_j][idx].cell;

        _slate.Transforms.setNodes(editor, {
          height: 0,
          width: 0,
          colspan: (cell.colspan || 1) - minColWidth + 1
        }, {
          at: table[1],
          match: function match(n) {
            return n.key === cell.key;
          }
        });
      };

      for (var _j = 0; _j < mergedGridTable.length; _j += 1) {
        _loop(_j);
      }
    }
  }

  var _Editor$nodes7 = _slate.Editor.nodes(editor, {
    at: selectedTable[0][0].originPath,
    match: function match(n) {
      return n.type === 'paragraph';
    }
  }),
      _Editor$nodes8 = _slicedToArray(_Editor$nodes7, 1),
      insertContents = _Editor$nodes8[0];

  Object.values(tmpContent).forEach(function (content) {
    if (content[0] && content[0].children) {
      _slate.Transforms.insertNodes(editor, content[0].children, {
        at: _slate.Editor.end(editor, insertContents[1])
      });
    }
  });
};

var _default = mergeSelection;
exports["default"] = _default;
//# sourceMappingURL=mergeSelection.js.map