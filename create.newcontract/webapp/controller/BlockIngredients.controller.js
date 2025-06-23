sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sync/ca/sd/create/newcontract/model/formatter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  function (Controller, formatter, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend(
      "sync.ca.sd.create.newcontract.controller.BlockIngredients",
      {
        formatter: formatter,

        onInit: function () {},
        onAddToCart: function (oEvent) {
          
          // console.log('test' + this.getOwnerComponent().getModel("quantityModel").getProperty("/quantities/MAT30001"));
          const oSource = oEvent.getSource();
          const oContext = oSource.getBindingContext(); // OData 모델(ProductSet)
          const oProduct = oContext.getObject(); // 제품 정보

          const sMatnr = oProduct.Matnr;
          console.log("✅ 현재 Matnr 확인:", sMatnr); // 이거 추가!

          // 수량은 별도의 JSON 모델인 quantityModel에서 가져온다
          const oQuantityModel =
            this.getOwnerComponent().getModel("quantityModel");
          console.log("🧾 수량 상태 확인:", oQuantityModel.getData());
          // console.log("수량 모델:", oQuantityModel.getProperty("/quantities"));
          // const iQuantity =
          //   parseInt(oQuantityModel.getProperty("/quantities/" + sMatnr)) || 1;


          const sQty = oQuantityModel.getProperty("/quantities/" + sMatnr);
          const iQuantity = parseInt(sQty, 10);


          // 수량 없으면 경고 후 return
          if (isNaN(iQuantity) || iQuantity <= 0) {
            MessageBox.error("수량을 입력해주세요.");
            return;
          } 

          // ✅ MessageToast 추가
          MessageToast.show("장바구니에 추가되었습니다.");

          console.log(" 장바구니에 추가할 제품:", {
            Matnr: sMatnr,
            Maktx: oProduct.Maktx,
            Regprice: oProduct.Regprice,
            Waers: oProduct.Waers,
            Meins: oProduct.Meins,
            Quantity: iQuantity,
          });

          // 장바구니 모델(cartModel)
          const oCartModel = this.getOwnerComponent().getModel("cartModel");
          const aCartItems = oCartModel.getProperty("/CartItems") || [];

          // 동일 제품 있는지 확인
          const iExistingIndex = aCartItems.findIndex(
            (item) => item.Matnr === sMatnr
          );

          if (iExistingIndex >= 0) {
            // 이미 있으면 수량만 증가
            aCartItems[iExistingIndex].Quantity += iQuantity;
          } else {
            // 새로 추가
            aCartItems.push({
              Matnr: oProduct.Matnr,
              Maktx: oProduct.Maktx,
              Regprice: oProduct.Regprice,
              Waers: oProduct.Waers,
              Meins: oProduct.Meins,
              Quantity: iQuantity,
              Vposn: "", // 나중에 계산해서 부여
              Netwr: 0 // 나중에 계산해서 부여
            });
            console.log("🛒 장바구니에 새 항목 추가:", aCartItems[aCartItems.length - 1]);
          }

          // 장바구니 모델 갱신
          oCartModel.setProperty("/CartItems", aCartItems);
          // oCartModel.setProperty("/CartItems", [...aCartItems]); // 얕은 복사
          console.log("🛒 장바구니 현재 상태:", oCartModel.getData());
          oCartModel.refresh(true); // force update if needed

          // End Column 열기 (TwoColumn Layout 적용 시)
          const oAppViewModel = this.getOwnerComponent().getModel("appView");
          oAppViewModel.setProperty("/layout", "TwoColumnsBeginExpanded");

          // input 필드 수량 모델 초기화
          oQuantityModel.setProperty("/quantities/" + sMatnr, ""); // 초기화
          // 강제로 Input 다시 업데이트 (optional)
          oQuantityModel.refresh(true); // ← 완전 강제 UI 갱신

          // 장바구니 총계약금액 재계산
          this.calculateTotalPrice();
        },
        onQuantityChange: function (oEvent) {
          const oInput = oEvent.getSource();
          const sValue = oEvent.getParameter("value");

          // 현재 바인딩된 제품 정보 (ProductSet)
          const oContext = oInput.getBindingContext();
          const sMatnr = oContext.getProperty("Matnr"); // 자재 번호

          // 수량 모델에 수량 값 반영
          const oQuantityModel =
            this.getOwnerComponent().getModel("quantityModel");
          const iQuantity = parseInt(sValue) || 0;

          oQuantityModel.setProperty("/quantities/" + sMatnr, iQuantity);

          console.log("✅ 수량 반영됨:", sMatnr, "→", iQuantity);
          console.log(
            "🧪 수량 모델 상태",
            this.getOwnerComponent().getModel("quantityModel").getData()
          );
          // 장바구니 총계약금액 재계산
          this.calculateTotalPrice();
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
