"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slate = require("slate");

var _selection = require("../selection");

var _splitCell = _interopRequireDefault(require("./splitCell"));

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var removeRow = function removeRow(table, editor) {
  var selection = editor.selection;
  if (!selection || !table) return;
  var path = table[1];

  var previous = _slate.Editor.previous(editor, {
    at: path
  });

  if (!previous) {
    if (table[0].children.length < 2) {
      _slate.Transforms.insertNodes(editor, {
        type: 'paragraph',
        children: [{
          text: ''
        }]
      }, {
        at: [0, 0]
      });

      var nextPath = path && path.length && _slate.Path.next(path);

      var nextNode = nextPath && (0, _utils.getNode)(editor, nextPath);

      if (nextNode && nextNode.type === 'table') {
        _slate.Transforms.removeNodes(editor, {
          at: nextPath
        });
      }

      return;
    }
  }

  var _splitedTable = (0, _selection.splitedTable)(editor, table),
      gridTable = _splitedTable.gridTable,
      getCol = _splitedTable.getCol;

  var yIndex = table[1].length;

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

  var yTop = startCol.path[yIndex];
  var yBottom = endCol.path[yIndex];
  var topLeftCol = gridTable[yTop][0];
  var bottomRight = gridTable[yBottom][gridTable[yBottom].length - 1];

  _slate.Transforms.setSelection(editor, {
    anchor: _slate.Editor.point(editor, topLeftCol.originPath),
    focus: _slate.Editor.point(editor, bottomRight.originPath)
  });

  (0, _splitCell["default"])(table, editor);
  var rowsToDelete = table[0].children.slice(yTop, yBottom + 1);
  rowsToDelete.forEach(function (row) {
    _slate.Transforms.removeNodes(editor, {
      at: table[1],
      match: function match(n) {
        return n.key === row.key;
      }
    });
  });
};

var _default = removeRow;
exports["default"] = _default;
//# sourceMappingURL=removeRow.js.map