sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend(
    "sync.ca.sd.create.newcontract.controller.Complete",
    {
      onInit: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("Complete")
          .attachPatternMatched(this._onPatternMatched, this);
      },

      _onPatternMatched: function (oEvent) {
        const oArgs = oEvent.getParameter("arguments");
        const sVbeln = oArgs.Vbeln; // 계약 번호
        console.log("넘어온 계약 번호:", sVbeln); // ← 여기에 undefined 뜨면 라우팅 문제

        const oBundle = this.getView().getModel("i18n").getResourceBundle();
        const sText = oBundle.getText("orderCompletedText", [sVbeln]);

        this.byId("orderCompletedText").setHtmlText(sText);
      },
    }
  );
});
