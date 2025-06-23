sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
  "use strict";

  return BlockBase.extend("sync.ca.sd.create.newcontract.view.blocks.BlockIngredients", {
    metadata: {
      views: {
        Collapsed: {
          viewName: "sync.ca.sd.create.newcontract.view.blocks.BlockIngredients",
          type: "XML"
        },
        Expanded: {
          viewName: "sync.ca.sd.create.newcontract.view.blocks.BlockIngredients",
          type: "XML"
        }
      }
    }
  });
});
