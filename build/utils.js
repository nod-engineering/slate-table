"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkTableIsExist = checkTableIsExist;
exports.isTableElement = isTableElement;
exports.isInSameTable = isInSameTable;

var _slate = require("slate");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function checkTableIsExist(editor, table) {
  var cells = Array.from(_slate.Editor.nodes(editor, {
    at: table[1],
    match: function match(n) {
      return n.type === 'table-cell';
    }
  }));
  return !!cells.length;
}

function isTableElement(type) {
  return type === 'table' || type === 'table-row' || type === 'table-cell' || type === 'table-content';
}

function isInSameTable(editor) {
  if (!editor.selection) return false;

  var _Editor$edges = _slate.Editor.edges(editor, editor.selection),
      _Editor$edges2 = _slicedToArray(_Editor$edges, 2),
      start = _Editor$edges2[0],
      end = _Editor$edges2[1];

  var _Editor$nodes = _slate.Editor.nodes(editor, {
    at: start,
    match: function match(n) {
      return n.type === 'table';
    }
  }),
      _Editor$nodes2 = _slicedToArray(_Editor$nodes, 1),
      startTable = _Editor$nodes2[0];

  var _Editor$nodes3 = _slate.Editor.nodes(editor, {
    at: end,
    match: function match(n) {
      return n.type === 'table';
    }
  }),
      _Editor$nodes4 = _slicedToArray(_Editor$nodes3, 1),
      endTable = _Editor$nodes4[0];

  if (startTable && endTable) {
    var _startTable = _slicedToArray(startTable, 2),
        startPath = _startTable[1];

    var _endTable = _slicedToArray(endTable, 2),
        endPath = _endTable[1];

    if (_slate.Path.equals(startPath, endPath)) {
      return true;
    }
  }

  return false;
}
//# sourceMappingURL=utils.js.map