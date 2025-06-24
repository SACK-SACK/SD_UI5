sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("sync.ca.sd.deliveryscheduledisplay.controller.CustomerInfo",{
		onInit: function () {
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel("app"); // 반드시 app 모델!

			this.oRouter.getRoute("RouteCustomerInfo").attachPatternMatched(this._onCustomerMatched, this);

			[oExitButton, oEnterButton].forEach(function (oButton) {
				oButton.addEventDelegate({
					onAfterRendering: function () {
						if (this.bFocusFullScreenButton) {
							this.bFocusFullScreenButton = false;
							oButton.focus();
						}
					}.bind(this)
				});
			}, this);
		},

	_onCustomerMatched: function (oEvent) {
        this._vbeln =
          oEvent.getParameter("arguments").vbeln || this._vbeln || "0";
        this._cuscode =
          oEvent.getParameter("arguments").cuscode || this._cuscode || "0";

        var sPath = "/ContractSet('" + this._vbeln + "')";

        this.getView().bindElement({
          path: sPath,
          model: undefined, // 기본 모델 사용
        });
      },

      handleFullScreen: function () {
        this.bFocusFullScreenButton = true;
        var sNextLayout = this.oModel.getProperty(
          "/actionButtonsInfo/endColumn/fullScreen"
        );
        this.oRouter.navTo("RouteCustomerInfo", {
          layout: sNextLayout,
          vbeln: this._vbeln,
          cuscode: this._cuscode,
        });
      },

      handleExitFullScreen: function () {
        this.bFocusFullScreenButton = true;
        var sNextLayout = this.oModel.getProperty(
          "/actionButtonsInfo/endColumn/exitFullScreen"
        );
        this.oRouter.navTo("RouteCustomerInfo", {
          layout: sNextLayout,
          vbeln: this._vbeln,
          cuscode: this._cuscode,
        });
      },

      handleClose: function () {
        var sNextLayout = this.oModel.getProperty(
          "/actionButtonsInfo/endColumn/closeColumn"
        );
        this.oRouter.navTo("RouteDetail", {
          layout: sNextLayout,
          vbeln: this._vbeln,
        });
      },
    }
  );
});
