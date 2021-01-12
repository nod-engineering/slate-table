"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slate = require("slate");

var _utils = require("../utils");

var toggleHeader = function toggleHeader(table, editor) {
  if (!table || !editor.selection) return;
  var tableData = table[0];

  if ((0, _utils.get)(tableData, 'headless', true)) {
    _slate.Transforms.setNodes(editor, {
      headless: false
    }, {
      at: table[1]
    });

    _slate.Transforms.setNodes(editor, {
      isHeader: true
    }, {
      at: table[1].concat([0])
    });
  } else {
    _slate.Transforms.setNodes(editor, {
      headless: true
    }, {
      at: table[1]
    });

    _slate.Transforms.setNodes(editor, {
      isHeader: false
    }, {
      at: table[1].concat([0])
    });
  }
};

var _default = toggleHeader;
exports["default"] = _default;
//# sourceMappingURL=toggleHeader.js.map