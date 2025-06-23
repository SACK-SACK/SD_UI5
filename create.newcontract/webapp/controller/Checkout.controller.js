sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sync/ca/sd/create/newcontract/model/formatter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
  ],
  function (Controller, formatter, MessageToast, MessageBox, History) {
    "use strict";
    return Controller.extend(
      "sync.ca.sd.create.newcontract.controller.Checkout",
      {
        formatter: formatter,
        calculateLineItemsMeta: function () {
          const oCartModel = this.getOwnerComponent().getModel("cartModel");
          const aItems = oCartModel.getProperty("/CartItems") || [];

          let iPos = 10;
          aItems.forEach(function (item) {
            item.Vposn = iPos.toString().padStart(3, "0"); // 010, 020, ...
            item.Netwr =
              (parseFloat(item.Regprice) || 0) * (parseInt(item.Quantity) || 0);
            console.log("계산된 Netwr:", item.Netwr);
            iPos += 10;
          });

          oCartModel.setProperty("/CartItems", aItems);
        },

        onInit() {
          // 자재당 개수 * 정가 = 순계약 금액
          this.calculateLineItemsMeta();

          const oStep2 = this.byId("CustomerInfoStep");
          console.log("oStep2:", oStep2);

          // Step2 진입할 때마다 계산 & 고객조회 수행
          oStep2.attachActivate(
            function () {
              this.onCustomerSelected();
            }.bind(this)
          );
        },

        /**
         * 이전 화면으로 이동 (기본 동작)
         */
        onBack: function () {
          var oHistory = History.getInstance();
          var sPreviousHash = oHistory.getPreviousHash();

          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            this.getOwnerComponent().getRouter().navTo("step2");
          }

          // var oRouter = this.getOwnerComponent().getRouter();
          // var oAppView = this.getOwnerComponent().getModel("appView");
          // oAppView.setProperty("/layout", "OneColumn");
          // oRouter.navTo("step2"); // 첫번째 컬럼만 다시 표시
        },

        onComplete: function () {
          //고객 정보 ODATA로 가져오기
          const oView = this.getView();
          const oContractModel = oView.getModel("contractModel");

          // 고객 상세 정보 가져오기
          const sCuscode = oContractModel.getProperty("/Cuscode");
          if (sCuscode) {
            const oODataModel = this.getOwnerComponent().getModel(); // OData
            console.log("고객 코드:", sCuscode);
            oODataModel.read(`/CustomerSet('${sCuscode}')`, {
              success: function (oData) {
                const oCustomerModel = new sap.ui.model.json.JSONModel(oData);
                oView.setModel(oCustomerModel, "customerModel");
              },
              error: function () {
                MessageBox.error("고객 상세 정보를 불러오는 데 실패했습니다.");
              },
            });
          }

          // this.calculateLineItemsMeta();
          // NavContainer 찾기
          const oNavContainer = this.byId("wizardNavContainer");

          // summaryPage로 이동
          oNavContainer.to(this.byId("summaryPage"));

          console.log("Wizard 완료 → summaryPage로 이동");
        },

        handleWizardSubmit: function () {
          console.log("주문 제출 시작");
          var oModel = this.getView().getModel(); // (계약 Header, Item) OData 모델
          console.log("OData 모델:", oModel);
          var oContractData = this.getView()
            .getModel("contractModel")
            .getData(); // 계약 데이터 모델
          var aItems =
            this.getOwnerComponent()
              .getModel("cartModel")
              .getProperty("/CartItems") || []; // 상세 항목
          var oRouter = this.getOwnerComponent().getRouter();

          // 1. 보낼 JSON payload 구성
          var oPayload = {
            Cuscode: oContractData.Cuscode,
            Cusname: oContractData.Cusname,
            Vbegdat: new Date(oContractData.Vbegdat), // ISO 날짜 문자열이어야 함
            Venddat: new Date(oContractData.Venddat), // ISO 날짜 문자열이어야 함
            Vlauez: "",
            Vlaufz: "",
            // Valdel: oContractData.Valdel,
            Valdel: String(oContractData.Valdel).padStart(3, "0"), // 계약 주기 수치값
            Valunit: oContractData.Valunit,
            Vuntdat: new Date(oContractData.Vuntdat), // 계약 체결일
            // Vbeln: "CTR0000052", // 계약 번호 -> odata로
            // Totdelvnum: String(oContractData.Totdelvnum).padStart(3, "0"), // 총 납품 수량
            Waers: oContractData.Waers, // 통화
            NetvalSum: oContractData.NetvalSum.toFixed(3), // 순계약 금액
            Bpadrr: oContractData.Bpadrr, // 주소
          };
          console.log("Payload:", oPayload);
          debugger;

          // 2. OData Create 요청
          oModel.create("/Contract_hSet", oPayload, {
            success: function (oCreatedHeader) {
              MessageToast.show("계약이 성공적으로 등록되었습니다.");

              // 3. 상세 항목 생성 반복
              aItems.forEach(function (item) {
                console.log("상세 항목 item 확인:", item);
                var oItemPayload = {
                  Vbeln: oCreatedHeader.Vbeln, // 헤더에서 받은 계약번호
                  Vposn: item.Vposn, // 위치 번호
                  Netval: item.Netwr.toFixed(2), // 순계약 금액
                  Matnr: item.Matnr,
                  //   Maktx: item.Maktx,
                  Qty: item.Quantity.toFixed(3),
                  Regprice: parseInt(item.Regprice).toFixed(2), // 정가
                  Waers: item.Waers,
                  Meins: item.Meins,
                };
                console.log("payload", oItemPayload);

                oModel.create("/Contract_iSet", oItemPayload, {
                  success: function () {
                    console.log("상세 생성 완료:", oItemPayload.Matnr);
                  },
                  error: function (oError) {
                    console.error(
                      "상세 생성 실패:",
                      oItemPayload.Matnr,
                      oError
                    );
                  },
                });
              });

              // 4. 완료 페이지 이동
              MessageToast.show("계약이 성공적으로 등록되었습니다.");
              //   oRouter.navTo("Complete", {
              //     layout: sap.f.LayoutType.OneColumn,
              //   });
              console.log("계약 번호:", oCreatedHeader.Vbeln);
              this.getOwnerComponent().getRouter().navTo("Complete", {
                Vbeln: oCreatedHeader.Vbeln, // 계약 번호
                layout: "OneColumn", // 또는 원하는 Layout 값
              });
            }.bind(this),
            error: function (oError) {
              MessageBox.error("계약 등록 중 오류가 발생했습니다.");
              console.error("헤더 생성 실패:", oError);
            },
          });

          //   // 다음 화면으로 이동
          //   var oRouter = this.getOwnerComponent().getRouter();
          //   oRouter.navTo("Complete", {
          //     layout: sap.f.LayoutType.OneColumn, // 또는 원하는 레이아웃
          //   }); // 원하는 라우트로 이동
        },

        handleWizardCancel: function() {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("step1");
        },

        onCustomerSelected: function () {
          const oView = this.getView();
          const oModel = oView.getModel("contractModel");
          const sCuscode = oModel.getProperty("/Cuscode");

          if (!sCuscode) return;
          console.log("고객 코드:", sCuscode);

          const oODataModel = this.getOwnerComponent().getModel(); // OData
          oODataModel.read(`/CustomerSet('${sCuscode}')`, {
            success: function (oData) {
              console.log("고객 상세 정보:", oData);
              const oCustomerModel = new sap.ui.model.json.JSONModel(oData);
              //   oView.setModel(oCustomerModel, "customerModel");
              this.getOwnerComponent().setModel(
                oCustomerModel,
                "customerModel"
              );
              this.getView().setModel(oCustomerModel, "customerModel");
              this.byId("wizardContentPage").setModel(
                oCustomerModel,
                "customerModel"
              );

              oView.invalidate();
              console.log("🆔 View ID:", this.getView().getId());
              console.log("Component:", this.getOwnerComponent());
              console.log(this.getView().getModel("customerModel").getData());
              oCustomerModel.refresh(true); // 강제 리프레시
            }.bind(this),
            error: function () {
              MessageBox.error("고객 상세 정보를 불러오지 못했습니다.");
            },
          });
        },
      }
    );
  }
);
