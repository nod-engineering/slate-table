"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slate = require("slate");

var removeTable = function removeTable(table, editor) {
  if (editor && table) {
    _slate.Transforms.removeNodes(editor, {
      match: function match(n) {
        return n.type === 'table';
      },
      at: table[1]
    });
  }
};

var _default = removeTable;
exports["default"] = _default;
//# sourceMappingURL=removeTable.js.map