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

var splitCell = function splitCell(table, editor) {
  var selection = editor.selection;
  if (!selection || !table) return;
  var yIndex = table[1].length;
  var xIndex = table[1].length + 1;

  var _splitedTable = (0, _selection.splitedTable)(editor, table),
      getCol = _splitedTable.getCol;

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

  if (!startNode || !endNode) return;

  var _getCol = getCol(function (n) {
    return n.cell.key === startNode[0].key;
  }),
      _getCol2 = _slicedToArray(_getCol, 1),
      startCell = _getCol2[0];

  var _getCol3 = getCol(function (n) {
    return n.cell.key === endNode[0].key;
  }),
      _getCol4 = _slicedToArray(_getCol3, 1),
      endCell = _getCol4[0];

  var _ref = [startCell.path[yIndex], endCell.path[yIndex]],
      yStart = _ref[0],
      yEnd = _ref[1];
  var _ref2 = [startCell.path[xIndex], endCell.path[xIndex]],
      xStart = _ref2[0],
      xEnd = _ref2[1];
  var sourceCells = [];
  var selectedCols = getCol(function (n) {
    if (n.cell.selectedCell) {
      return true;
    }

    var _n$path$slice = n.path.slice(yIndex, xIndex + 1),
        _n$path$slice2 = _slicedToArray(_n$path$slice, 2),
        y = _n$path$slice2[0],
        x = _n$path$slice2[1];

    if (y >= yStart && y <= yEnd && x >= xStart && x <= xEnd) {
      if (!n.isReal) {
        var _getCol5 = getCol(function (s) {
          return s.isReal && s.cell.key === n.cell.key;
        }),
            _getCol6 = _slicedToArray(_getCol5, 1),
            sourceCell = _getCol6[0];

        sourceCells.push(sourceCell);
      }

      return true;
    }

    return false;
  });
  selectedCols.push.apply(selectedCols, sourceCells);
  var filterColsObject = selectedCols.reduce(function (p, c) {
    if (c.isReal) {
      // eslint-disable-next-line no-param-reassign
      p[c.cell.key] = c;
    }

    return p;
  }, {});
  Object.values(filterColsObject).forEach(function (col) {
    var cell = col.cell,
        isReal = col.isReal,
        originPath = col.originPath;
    var _cell$rowspan = cell.rowspan,
        rowspan = _cell$rowspan === void 0 ? 1 : _cell$rowspan,
        _cell$colspan = cell.colspan,
        colspan = _cell$colspan === void 0 ? 1 : _cell$colspan,
        children = cell.children;

    if (isReal && (rowspan !== 1 || colspan !== 1)) {
      _slate.Transforms["delete"](editor, {
        at: originPath
      });

      for (var i = 0; i < rowspan; i += 1) {
        for (var j = 0; j < colspan; j += 1) {
          var newPath = Array.from(originPath);
          newPath[yIndex] += i;
          var newCell = (0, _creator.createCell)({
            width: 0,
            height: 0,
            elements: i === 0 && j === colspan - 1 ? children[0].children : null
          });

          _slate.Transforms.insertNodes(editor, newCell, {
            at: newPath
          });
        }
      }
    }
  });
};

var _default = splitCell;
exports["default"] = _default;
//# sourceMappingURL=splitCell.js.map