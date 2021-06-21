"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slate = require("slate");

var _utils = require("../utils");

var removeTable = function removeTable(table, editor) {
  if (!editor || !table) return;
  var path = table[1];

  var previous = _slate.Editor.previous(editor, {
    at: path
  });

  if (!previous) {
    _slate.Transforms.insertNodes(editor, {
      type: 'paragraph',
      children: [{
        text: ' '
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

  _slate.Transforms.removeNodes(editor, {
    match: function match(n) {
      return n.type === 'table';
    },
    at: path
  });
};

var _default = removeTable;
exports["default"] = _default;
//# sourceMappingURL=removeTable.js.map