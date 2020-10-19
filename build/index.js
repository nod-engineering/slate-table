"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "withTable", {
  enumerable: true,
  get: function get() {
    return _withTable["default"];
  }
});
exports.commands = exports.helloWorld = void 0;

var _insertTable = _interopRequireDefault(require("./commands/insertTable"));

var _insertBelow = _interopRequireDefault(require("./commands/insertBelow"));

var _insertRight = _interopRequireDefault(require("./commands/insertRight"));

var _removeTable = _interopRequireDefault(require("./commands/removeTable"));

var _removeColumn = _interopRequireDefault(require("./commands/removeColumn"));

var _removeRow = _interopRequireDefault(require("./commands/removeRow"));

var _mergeSelection = _interopRequireDefault(require("./commands/mergeSelection"));

var _splitCell = _interopRequireDefault(require("./commands/splitCell"));

var _checker = _interopRequireDefault(require("./commands/checker"));

var _withTable = _interopRequireDefault(require("./withTable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var helloWorld = function helloWorld() {
  return console.log('Hello World!');
};

exports.helloWorld = helloWorld;
var commands = {
  insertTable: _insertTable["default"],
  insertBelow: _insertBelow["default"],
  insertRight: _insertRight["default"],
  removeTable: _removeTable["default"],
  removeColumn: _removeColumn["default"],
  removeRow: _removeRow["default"],
  mergeSelection: _mergeSelection["default"],
  splitCell: _splitCell["default"],
  checker: _checker["default"]
};
exports.commands = commands;
//# sourceMappingURL=index.js.map