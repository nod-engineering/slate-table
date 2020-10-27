"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeSelection = removeSelection;
exports.addSelection = addSelection;
exports.splitedTable = void 0;

var _slate = require("slate");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var splitedTable = function splitedTable(editor, table, startKey) {
  var tableDepth = table[1].length;
  var cells = [];

  var nodes = _slate.Editor.nodes(editor, {
    at: table[1],
    match: function match(n) {
      return n.type === 'table_cell';
    }
  });

  var _iterator = _createForOfIteratorHelper(nodes),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var node = _step.value;

      var _node = _slicedToArray(node, 2),
          _cell = _node[0],
          _path = _node[1];

      cells.push({
        cell: _cell,
        path: _path,
        realPath: _toConsumableArray(_path)
      });
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  var gridTable = [];
  var insertPosition = null;

  for (var i = 0; i < cells.length; i++) {
    var _cells$i = cells[i],
        cell = _cells$i.cell,
        path = _cells$i.path,
        realPath = _cells$i.realPath;
    var _cell$rowspan = cell.rowspan,
        rowspan = _cell$rowspan === void 0 ? 1 : _cell$rowspan,
        _cell$colspan = cell.colspan,
        colspan = _cell$colspan === void 0 ? 1 : _cell$colspan;
    var y = path[tableDepth];
    var x = path[tableDepth + 1];

    if (!gridTable[y]) {
      gridTable[y] = [];
    }

    while (gridTable[y][x]) {
      x++;
    }

    for (var j = 0; j < rowspan; j++) {
      for (var k = 0; k < colspan; k++) {
        var _y = y + j;

        var _x = x + k;

        if (!gridTable[_y]) {
          gridTable[_y] = [];
        }

        gridTable[_y][_x] = {
          cell: cell,
          path: [].concat(_toConsumableArray(realPath.slice(0, tableDepth)), [_y, _x]),
          isReal: rowspan === 1 && colspan === 1 || _y === y && _x === x,
          originPath: path
        };

        if (!insertPosition && cell.key === startKey) {
          insertPosition = gridTable[_y][_x];
          gridTable[_y][_x].isInsertPosition = true;
        }
      }
    }
  }

  var getCol = function getCol(match) {
    var result = [];
    gridTable.forEach(function (row) {
      row.forEach(function (col) {
        if (match && match(col)) {
          result.push(col);
        }
      });
    });
    return result;
  };

  return {
    gridTable: gridTable,
    tableDepth: tableDepth,
    getCol: getCol
  };
};

exports.splitedTable = splitedTable;

function removeSelection(editor) {
  _slate.Transforms.unsetNodes(editor, 'selectedCell', {
    at: [],
    match: function match(n) {
      return !!n.selectedCell;
    }
  });
}

function addSelection(editor, table, startPath, endPath) {
  removeSelection(editor); // addSelectionStyle();

  if (!table) return [];

  var _splitedTable = splitedTable(editor, table),
      gridTable = _splitedTable.gridTable,
      getCol = _splitedTable.getCol;

  if (!getCol || !gridTable) return [];

  var _getCol = getCol(function (n) {
    return _slate.Path.equals(_slate.Editor.path(editor, n.originPath), startPath) && n.isReal;
  }),
      _getCol2 = _slicedToArray(_getCol, 1),
      head = _getCol2[0];

  var _getCol3 = getCol(function (n) {
    return _slate.Path.equals(_slate.Editor.path(editor, n.originPath), endPath) && n.isReal;
  }),
      _getCol4 = _slicedToArray(_getCol3, 1),
      tail = _getCol4[0];

  if (!tail || !head) return [];
  var tailPath = tail.path;
  var headPath = head.path;
  headPath.forEach(function (item, index) {
    headPath[index] = Math.min(item, tailPath[index]);
    tailPath[index] = Math.max(item, tailPath[index]);
  });
  var coverCols = [];
  gridTable.forEach(function (row) {
    row.forEach(function (col) {
      var path = col.path;
      var isOver = path.findIndex(function (item, index) {
        if (item < headPath[index] || item > tailPath[index]) {
          return true;
        }

        return false;
      });

      if (isOver < 0) {
        coverCols.push(col);
      }
    });
  });
  coverCols.forEach(function (_ref) {
    var originPath = _ref.originPath;

    _slate.Transforms.setNodes(editor, {
      selectedCell: true
    }, {
      at: originPath,
      match: function match(n) {
        return n.type === 'table_cell';
      }
    });
  });
  return coverCols;
} // export function removeSelectionStyle() {
//   const style = document.querySelector(`style#${insertStyleId}`);
//   if (style) {
//     const head = document.getElementsByTagName('head');
//     const first = head && head.item(0);
//     first && first.removeChild(style);
//   }
// }
// export function addSelectionStyle() {
//   // HACK: Add ::selection style when greater than 1 cells selected.
//   if (!document.querySelector(`style#${insertStyleId}`)) {
//     const style = document.createElement('style');
//     style.type = 'text/css';
//     style.id = insertStyleId;
//     const head = document.getElementsByTagName('head');
//     const first = head && head.item(0);
//     if (first) {
//       first.appendChild(style);
//       const stylesheet = style.sheet;
//       if (stylesheet) {
//         (stylesheet as CSSStyleSheet).insertRule(
//           `table *::selection { background: none; }`,
//           (stylesheet as CSSStyleSheet).cssRules.length
//         );
//       }
//     }
//   }
// }
//# sourceMappingURL=selection.js.map