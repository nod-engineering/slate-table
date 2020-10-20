"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slate = require("slate");

var _selection = require("../selection");

var _creator = require("../creator");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var insertRight = function insertRight(table, editor) {
  var selection = editor.selection;
  if (!selection || !table) return;
  var xIndex = table[1].length + 1;

  var _splitedTable = (0, _selection.splitedTable)(editor, table),
      gridTable = _splitedTable.gridTable,
      getCol = _splitedTable.getCol;

  var _Editor$nodes = _slate.Editor.nodes(editor, {
    match: function match(n) {
      return n.type === 'table_cell';
    }
  }),
      _Editor$nodes2 = _slicedToArray(_Editor$nodes, 1),
      startCell = _Editor$nodes2[0];

  var _getCol = getCol(function (c) {
    return c.cell.key === startCell[0].key && c.isReal;
  }),
      _getCol2 = _slicedToArray(_getCol, 1),
      insertPositionCol = _getCol2[0];

  var x = insertPositionCol.path[xIndex] + (insertPositionCol.cell.colspan || 1) - 1;
  var insertCols = new Map();
  var checkInsertable = true;
  gridTable.forEach(function (row) {
    var col = row[x];

    var _getCol3 = getCol(function (n) {
      return n.cell.key === col.cell.key && n.isReal;
    }),
        _getCol4 = _slicedToArray(_getCol3, 1),
        originCol = _getCol4[0];

    var cell = originCol.cell,
        path = originCol.path;

    if (!row[x + 1] || col.isReal && (!col.cell.colspan || col.cell.colspan === 1)) {
      insertCols.set(cell.key, originCol);
    } else if (path[xIndex] + (cell.colspan || 1) - 1 === x) {
      insertCols.set(cell.key, originCol);
    } else {
      checkInsertable = false;
    }
  });

  if (!checkInsertable) {
    return;
  }

  insertCols.forEach(function (col) {
    var newCell = (0, _creator.createCell)({
      rowspan: col.cell.rowspan || 1
    });

    _slate.Transforms.insertNodes(editor, newCell, {
      at: _slate.Path.next(col.originPath)
    });
  });
};

var _default = insertRight;
exports["default"] = _default;
//# sourceMappingURL=insertRight.js.map