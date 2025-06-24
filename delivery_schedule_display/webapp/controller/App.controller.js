sap.ui.define(
  ["sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller"],
  (JSONModel, BaseController) => {
    "use strict";

    return BaseController.extend(
      "sync.ca.sd.deliveryscheduledisplay.controller.App",
      {
        onInit: function () {
          this.currentRouteName = null;
         this.currentVbeln = null;
         this.currentCuscode = null;

          const oLayoutModel = new JSONModel();
          this.getOwnerComponent().setModel(oLayoutModel, "app"); // 'app'이라는 이름의 JSONModel 생성

          this.oRouter = this.getOwnerComponent().getRouter();
          this.oRouter.attachRouteMatched(this.onRouteMatched, this);
          this.oRouter.attachBeforeRouteMatched(
            this.onBeforeRouteMatched,
            this
          );
        },
        onBeforeRouteMatched: function (oEvent) {
          var oModel = this.getOwnerComponent().getModel("app"); // JSONModel
          var sLayout = oEvent.getParameters().arguments.layout;

          if (!sLayout) {
            var oNextUIState = this.getOwnerComponent()
              .getHelper()
              .getNextUIState(0);
            sLayout = oNextUIState.layout;
          }

          if (sLayout) {
            oModel.setProperty("/layout", sLayout);
          }
        },

        onRouteMatched: function (oEvent) {
          var sRouteName = oEvent.getParameter("name"),
            oArguments = oEvent.getParameter("arguments");

          this._updateUIElements();

          // Save the current route name
          this.currentRouteName = sRouteName;
          this.currentVbeln = oArguments.vbeln;
          this.currentCuscode = oArguments.cuscode;
        },

        onStateChanged: function (oEvent) {
          var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
            sLayout = oEvent.getParameter("layout");

          this._updateUIElements();

          // Replace the URL with the new layout if a navigation arrow was used
          if (bIsNavigationArrow) {
            this.oRouter.navTo(this.currentRouteName, {
              layout: sLayout,
              vbeln: this.currentVbeln,
              cuscode: this.currentCuscode,
            });
          }
        },

        // Update the close/fullscreen buttons visibility
        _updateUIElements: function () {
          var oModel = this.getOwnerComponent().getModel("app"); // 
          var oUIState = this.getOwnerComponent()
            .getHelper()
            .getCurrentUIState();
          oModel.setProperty("/layout", oUIState.layout);
          oModel.setProperty("/actionButtonsInfo", oUIState.actionButtonsInfo);
        },
        handleClose: function () {
          window.history.go(-1);
        },

        onBack: function () {
          window.history.go(-1);
        },

        onExit: function () {
          this.oRouter.detachRouteMatched(this.onRouteMatched, this);
          this.oRouter.detachBeforeRouteMatched(
            this.onBeforeRouteMatched,
            this
          );
        },
      }
    );
  }
);
