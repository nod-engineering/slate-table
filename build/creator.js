"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createContent = createContent;
exports.createCell = createCell;
exports.createRow = createRow;
exports.createTable = createTable;

var _uuid = require("uuid");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function createContent(elements) {
  return {
    type: 'paragraph',
    children: elements || [{
      text: ''
    }]
  };
}

function createCell() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      elements = _ref.elements,
      colspan = _ref.colspan,
      rowspan = _ref.rowspan,
      height = _ref.height,
      width = _ref.width;

  var content = createContent(elements);
  return {
    type: 'table_cell',
    key: "cell_".concat((0, _uuid.v4)()),
    children: [content],
    width: width,
    height: height,
    colspan: colspan,
    rowspan: rowspan
  };
}

function createRow(columns) {
  var cellNodes = _toConsumableArray(new Array(columns)).map(function () {
    return createCell();
  });

  return {
    type: 'table_row',
    key: "row_".concat((0, _uuid.v4)()),
    data: {},
    children: cellNodes
  };
}

function createTable(columns, rows) {
  var rowNodes = _toConsumableArray(new Array(rows)).map(function () {
    return createRow(columns);
  });

  return {
    type: 'table',
    children: rowNodes,
    data: {}
  };
}
//# sourceMappingURL=creator.js.map