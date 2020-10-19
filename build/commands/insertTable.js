"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slate = require("slate");

var _creator = require("../creator");

var insertTable = function insertTable(editor) {
  console.log('test');
  if (!editor.selection) return;

  var node = _slate.Editor.above(editor, {
    match: function match(n) {
      return n.type === 'table';
    }
  });

  var isCollapsed = _slate.Range.isCollapsed(editor.selection);

  if (!node && isCollapsed) {
    var table = (0, _creator.createTable)(2, 2);

    _slate.Transforms.insertNodes(editor, table);
  }
};

var _default = insertTable;
exports["default"] = _default;
//# sourceMappingURL=insertTable.js.map