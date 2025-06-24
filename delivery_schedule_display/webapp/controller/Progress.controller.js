sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("sync.ca.sd.deliveryscheduledisplay.controller.Progress", {
//     onInit: function () {
//       const oExitButton = this.getView().byId("exitFullScreenBtn");
//       const oEnterButton = this.getView().byId("enterFullScreenBtn");

//       this.oRouter = this.getOwnerComponent().getRouter();
//       this.oModel = this.getOwnerComponent().getModel("app");

//       this.oRouter
//         .getRoute("RouteDelivProgress")
//         .attachPatternMatched(this._onMatched, this);

//       [oExitButton, oEnterButton].forEach(function (oButton) {
//         oButton.addEventDelegate({
//           onAfterRendering: function () {
//             if (this.bFocusFullScreenButton) {
//               this.bFocusFullScreenButton = false;
//               oButton.focus();
//             }
//           }.bind(this),
//         });
//       }, this);
//     },

//    onMatched: function (oEvent) {
//   const oArgs = oEvent.getParameter("arguments");
//   const sVbeln = oArgs.vbeln;
//   const sCuscode = oArgs.cuscode;

//   if (!sVbeln || sVbeln === "0") {
//     console.error("❗ 유효하지 않은 계약문서번호(Vbeln):", sVbeln);
//     return;
//   }

//   this._vbeln = sVbeln;
//   this._cuscode = sCuscode;

//   const sPath = "/ContractSet('" + sVbeln + "')";

//   const oSmartChart = this.byId("smartChartDonut");
//   if (oSmartChart) {
//     console.log("📊 도넛 차트 바인딩 시도:", sPath);
//     oSmartChart.setChartBindingPath(sPath);
//     oSmartChart.rebindChart();
//   } else {
//     console.warn("⚠ smartChartDonut ID가 뷰에 없음");
//   }
// },

//     handleFullScreen: function () {
//       this.bFocusFullScreenButton = true;
//       const sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/fullScreen");
//       this.oRouter.navTo("RouteDelivProgress", {
//         layout: sNextLayout,
//         vbeln: this._vbeln,
//         cuscode: this._cuscode,
//       });
//     },

//     handleExitFullScreen: function () {
//       this.bFocusFullScreenButton = true;
//       const sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
//       this.oRouter.navTo("RouteDelivProgress", {
//         layout: sNextLayout,
//         vbeln: this._vbeln,
//         cuscode: this._cuscode,
//       });
//     },

//     handleClose: function () {
//       const sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");
//       this.oRouter.navTo("RouteDetail", {
//         layout: sNextLayout,
//         vbeln: this._vbeln,
//         cuscode: this._cuscode,
//       });
//     }
  });
});
