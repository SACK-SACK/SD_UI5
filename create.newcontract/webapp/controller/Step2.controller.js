sap.ui.define(
  [
    "sync/ca/sd/create/newcontract/controller/BaseController",
    "sync/ca/sd/create/newcontract/model/formatter",
  ],
  function (BaseController, formatter) {
    return BaseController.extend(
      "sync.ca.sd.create.newcontract.controller.Step2",
      {
        formatter: formatter,
        onInit: function () {
          // const oProductModel = this.getView().getModel("ProductSet");
          // console.log("📦 제품 모델:", oProductModel);
          // const oQuantityModel = this.getOwnerComponent().getModel("quantityModel");
          // console.log("📦 수량 모델:", oQuantityModel);
          // oProductModel.read("/ProductSet", {
          //   success: function (oData) {
          //     const oQuantities = {};
          //     oData.results.forEach(product => {
          //       oQuantities[product.Matnr] = 1;
          //     });
          //     // 🛠️ 이 this는 Controller를 의미하게 됨
          //     oQuantityModel.setProperty("/quantities", oQuantities);
          //     console.log("✅ 초기화된 수량 모델:", oQuantities);
          //   }.bind(this) // ← 이거 안 하면 바인딩이 안 됨
          // });
        },

        // onOpenCart: function () {
        //   // this.getOwnerComponent().getModel("appView").setProperty("/layout", "ThreeColumnsMidExpanded");
        //   // this.getRouter().navTo("CartSidebar");

        //   this.getOwnerComponent().getRouter().navTo("CartSidebar", {layout: "TwoColumnsBeginExpanded"});
        // }
        onOpenCart: function (oEvent) {
          const bPressed = oEvent.getParameter("pressed");
          const oAppView = this.getModel("appView");
          const oRouter = this.getRouter();

          if (bPressed) {
            oAppView.setProperty("/layout", "TwoColumnsBeginExpanded");
            oRouter.navTo("cartSidebar");
          } else {
            oAppView.setProperty("/layout", "OneColumn");
            oRouter.navTo("step2"); // 첫번째 컬럼만 다시 표시
          }
        },
        onBack: function () {
          var oHistory = sap.ui.core.routing.History.getInstance();
          var sPreviousHash = oHistory.getPreviousHash();

          if (sPreviousHash !== undefined) {
            window.history.go(-1); // 브라우저 히스토리로 이전
          } else {
            // 이전 페이지가 없으면 기본 라우트로 이동 (예: Main)
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMain", {}, true);
          }
        },

      }
    );
  }
);
