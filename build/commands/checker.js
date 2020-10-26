"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slate = require("slate");

var _mergeSelection = require("./mergeSelection");

var _selection = require("../selection");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var checker = function checker(table, editor, direction) {
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

  var selectedTable = (0, _mergeSelection.checkMerge)(gridTable, startNode, direction);
  var startNodeColspan = startNode[0].colspan || 1;
  var startNodeRowspan = startNode[0].rowspan || 1;
  var hasMergedCells = startNodeColspan > 1 || startNodeRowspan > 1;

  if (direction === 'down') {
    var selectedTableLen = selectedTable.length;
    if (selectedTableLen < 2 || startNodeRowspan === selectedTableLen) return false;
    var nextNodeColspan = selectedTable[selectedTableLen - 1][0].cell.colspan || undefined;
    if (startNodeColspan === 1 && nextNodeColspan === undefined) return true;
    if (startNodeColspan !== nextNodeColspan) return false;
    return true;
  }

  if (direction === 'right') {
    console.log('selected', selectedTable);
    var _selectedTableLen = selectedTable[0].length;
    if (_selectedTableLen < 2 || startNodeColspan === _selectedTableLen) return false;
    var nextNodeRowspan = selectedTable[0][_selectedTableLen - 1].cell.rowspan || undefined;
    if (startNodeRowspan === 1 && nextNodeRowspan === undefined) return true;
    if (startNodeRowspan !== nextNodeRowspan) return false;
    return true;
  }

  if (!direction && hasMergedCells) {
    return true;
  }

  return false;
};

var _default = checker;
exports["default"] = _default;
//# sourceMappingURL=checker.js.map