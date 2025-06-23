sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sync/ca/sd/create/newcontract/model/formatter",
  ],
  function (Controller, formatter) {
    "use strict";
    return Controller.extend(
      "sync.ca.sd.create.newcontract.controller.CartSidebar",
      {
        formatter: formatter,
        onInit() {
          
        },
        //수정 후 done 버튼
        onEditOrDoneButtonPress: function () {
          const oCfgModel = this.getView().getModel("cfg");
          const bInDelete = oCfgModel.getProperty("/inDelete");

          oCfgModel.setProperty("/inDelete", !bInDelete);
          oCfgModel.setProperty("/notInDelete", bInDelete);
          oCfgModel.setProperty("/listMode", bInDelete ? "None" : "Delete");
        },
        //수정 버튼 클릭 후 나오는 삭제 버튼
        onCartItemDelete: function (oEvent) {
          const oItem = oEvent.getParameter("listItem");
          const oContext = oItem.getBindingContext("cartModel");
          const sPath = oContext.getPath();
          const oCartModel = this.getView().getModel("cartModel");

          sap.m.MessageBox.confirm("정말로 이 항목을 삭제하시겠습니까?", {
            title: "삭제 확인",
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            onClose: function (oAction) {
              if (oAction === sap.m.MessageBox.Action.YES) {
                const aItems = oCartModel.getProperty("/CartItems");
                aItems.splice(parseInt(sPath.split("/")[2]), 1); // index 추출 후 삭제
                oCartModel.setProperty("/CartItems", aItems);
                 // 장바구니 총계약금액 재계산
                this.calculateTotalPrice();
              }
            }.bind(this),
          });
           // 장바구니 총계약금액 재계산
          // this.calculateTotalPrice();
        },
        onProceedButtonPress: function () {
          // 장바구니에 담긴 각 자재의 순계약 금액(Netwr) 계산
          const oCartModel = this.getOwnerComponent().getModel("cartModel");
          const aItems = oCartModel.getProperty("/CartItems") || [];
          aItems.forEach(function (item) {
            item.Netwr = (parseFloat(item.Regprice) || 0) * (parseInt(item.Quantity) || 0);
            console.log("계산된 Netwr:", item.Netwr);
          });
          oCartModel.setProperty("/CartItems", aItems);

          //화면 이동
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("Checkout", {
            layout: sap.f.LayoutType.OneColumn, // 또는 원하는 레이아웃
          });
        },
        onBack: function () {
          var oRouter = this.getOwnerComponent().getRouter();
          var oAppView = this.getOwnerComponent().getModel("appView");
          oAppView.setProperty("/layout", "OneColumn");
          oRouter.navTo("step2"); // 첫번째 컬럼만 다시 표시
        },
        // 장바구니에 있는 항목의 총계약금액 계산
        calculateTotalPrice: function () {
          var oView = this.getView();
          var oCartModel = oView.getModel("cartModel");
          var oContractModel = oView.getModel("contractModel");

          var aItems = oCartModel.getProperty("/CartItems");
          if (!Array.isArray(aItems)) {
            oContractModel.setProperty("/NetvalSum", 0);
            return;
          }

          var fTotal = aItems.reduce(function (sum, item) {
            var fPrice = parseFloat(item.Regprice) || 0;
            var iQty = parseInt(item.Quantity) || 0;
            return sum + fPrice * iQty;
          }, 0);

          // 👉 숫자 그대로 저장
          oContractModel.setProperty("/NetvalSum", fTotal);

          console.log("🧾 총계약금액(NetvalSum):", typeof fTotal, fTotal);

        },
      }
    );
  }
);
