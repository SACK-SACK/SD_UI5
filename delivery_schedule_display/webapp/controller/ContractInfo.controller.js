sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("sync.ca.sd.deliveryscheduledisplay.controller.ContractInfo", {
    onInit: function () {
      const oExitButton = this.getView().byId("exitFullScreenBtn");
      const oEnterButton = this.getView().byId("enterFullScreenBtn");

      this.oRouter = this.getOwnerComponent().getRouter();
      this.oModel = this.getOwnerComponent().getModel("app"); // 반드시 app 모델

      // ✅ 계약 상세화면에 진입했을 때 패턴 처리
      this.oRouter
        .getRoute("RouteContractInfo")
        .attachPatternMatched(this._onMatched, this);

      [oExitButton, oEnterButton].forEach(
        function (oButton) {
          oButton.addEventDelegate({
            onAfterRendering: function () {
              if (this.bFocusFullScreenButton) {
                this.bFocusFullScreenButton = false;
                oButton.focus();
              }
            }.bind(this),
          });
        },
        this
      );
    },

    // ✅ 라우팅 파라미터 처리 및 데이터 바인딩
    _onMatched: function (oEvent) {
      const sVbeln = oEvent.getParameter("arguments").vbeln;
      const sCuscode = oEvent.getParameter("arguments").cuscode;

      if (!sVbeln) {
        console.warn("❗ 계약 문서번호 없음");
        return;
      }

      this._vbeln = sVbeln;
      this._cuscode = sCuscode; // 없어도 상관없지만 full screen 버튼을 위해 저장

      const sPath = "/ContractSet('" + sVbeln + "')";
      this.getView().bindElement({ path: sPath });

      console.log("✅ 계약 화면 바인딩:", sPath);
    },

    handleFullScreen: function () {
      this.bFocusFullScreenButton = true;
      const sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/fullScreen");
      this.oRouter.navTo("RouteContractInfo", {
        layout: sNextLayout,
        vbeln: this._vbeln,
        cuscode: this._cuscode,
      });
    },

    handleExitFullScreen: function () {
      this.bFocusFullScreenButton = true;
      const sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
      this.oRouter.navTo("RouteContractInfo", {
        layout: sNextLayout,
        vbeln: this._vbeln,
        cuscode: this._cuscode,
      });
    },

    handleClose: function () {
      const sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");
      this.oRouter.navTo("RouteDetail", {
        layout: sNextLayout,
        vbeln: this._vbeln,
      });
    },
  });
});
