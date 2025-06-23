sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("sync.ca.sd.create.newcontract.controller.App", {
    onInit: function () {
      var oRouter = this.getOwnerComponent().getRouter();

      // Manifest.json에서 Route의 경로가 일치하기 전에 () 안의 Function이 실행된다.
      oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);

      // Manifest.json에서 Route의 경로가 일치하면 () 안의 Function이 실행된다.
      oRouter.attachRouteMatched(this.onRouteMatched, this);
    },

    onBeforeRouteMatched: function (oEvent) {
      // oEvent 는 경로에 대한 정보를 갖고 있다.

      var oArgs = oEvent.getParameter("arguments");
      var layout = oArgs.layout;

      if (!layout) {
        // debugger;
        layout = sap.f.LayoutType.OneColumn; //; "OneColumn";
        var oLayoutInfo = this.getOwnerComponent().getFlexibleLayoutInfo();
        layout = oLayoutInfo.getNextUIState(0).layout; // "OneColumn"
        // layout = oLayoutInfo.getNextUIState(1).layout; // "TwoColumns"
      }

      if (layout) {
        var oModelApp = this.getOwnerComponent().getModel("appView");
        oModelApp.setProperty("/layout", layout);
      }
    },

    onRouteMatched: function (oEvent) {
      // oEvent 는 경로에 대한 정보를 갖고 있다.
      var oRouteName = oEvent.getParameter("name"); // RouteMain or RouteDetail
      var oArgs = oEvent.getParameter("arguments");

      var oModelApp = this.getOwnerComponent().getModel("appView");
      var oUIState = this.getOwnerComponent()
        .getFlexibleLayoutInfo()
        .getCurrentUIState();
      oModelApp.setData(oUIState);

      // 현재 화면이 RouteMain 인지 RouteDetail 인지 App Contoller의 전역멤버로 관리한다.
      this.currentRouteName = oRouteName;
      // this.currentCarrid = oArgs.Carrid; // RouteDetail 일 때만 값이 존재
      // this.currentConnid = oArgs.Connid; // RouteDetail 일 때만 값이 존재
    },
    onStateChange(oEvent) {
      var isNavigationArrow = oEvent.getParameter("isNavigationArrow");
      var layout = oEvent.getParameter("layout");

      var oModelApp = this.getOwnerComponent().getModel("appView");
      var oUIState = this.getOwnerComponent()
        .getFlexibleLayoutInfo()
        .getCurrentUIState();
      oModelApp.setData(oUIState);

      if (isNavigationArrow) {
        this.getOwnerComponent().getRouter().navTo(this.currentRouteName, {
          layout: layout,
        });
      }
    },
  });
});
